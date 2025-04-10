from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from gradio_client import Client
from .models import DiaryEntry, DiaryFolder
from .serializers import DiaryEntrySerializer, DiaryFolderSerializer
from .utils import fetch_das_scores, calculate_cumulative_scores
from django.db.models import Avg
from django.http import JsonResponse
import json
from datetime import timedelta, date, datetime
from django.utils import timezone
from traceback import format_exc
from django.utils.timezone import localdate



client = Client("Karanjain09/Text_Analysis")

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_folders(request):
    """List all folders of the authenticated user, ordered by newest first."""
    folders = DiaryFolder.objects.filter(user=request.user).order_by("-created_at")
    serializer = DiaryFolderSerializer(folders, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_folder_and_entries(request):
    try:
        data = request.data.copy()
        data["user"] = request.user.pk
        serializer = DiaryFolderSerializer(data=data)

        if serializer.is_valid():
            folder = serializer.save(user=request.user)
            today = timezone.localdate()

            DiaryEntry.objects.bulk_create([
                DiaryEntry(
                    folder=folder,
                    user=request.user, 
                    title=f"Entry {i+1}",
                    content="",
                    date=today + timedelta(days=i)
                ) for i in range(5)
            ])

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        else:
            print("Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        print("Exception occurred:", str(e))
        print(format_exc())
        return Response({"error": "Internal Server Error", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET", "DELETE"])
@permission_classes([IsAuthenticated])
def retrieve_or_delete(request, pk):
    """Retrieve or delete a specific folder belonging to the authenticated user."""
    folder = get_object_or_404(DiaryFolder, pk=pk, user=request.user)

    if request.method == "GET":
        serializer = DiaryFolderSerializer(folder)
        return Response(serializer.data)

    elif request.method == "DELETE":
        folder.delete()
        return Response({"message": "Folder deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def folder_entries(request, pk):
    """
    List all diary entries inside a specific folder owned by the authenticated user.
    """
    try:
        folder = DiaryFolder.objects.get(id=pk, user=request.user)
        entries = DiaryEntry.objects.filter(folder=folder).order_by("date")
        serializer = DiaryEntrySerializer(entries, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except DiaryFolder.DoesNotExist:
        return Response({"error": "Folder not found or unauthorized."}, status=status.HTTP_404_NOT_FOUND)



@api_view(["PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def update_folder(request, pk):
    """Update a folder belonging to the authenticated user."""
    folder = get_object_or_404(DiaryFolder, pk=pk, user=request.user)
    serializer = DiaryFolderSerializer(folder, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_diary_entries(request):
    entries = DiaryEntry.objects.filter(user=request.user).order_by("-created_at")
    serializer = DiaryEntrySerializer(entries, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_diary_entry(request):
    serializer = DiaryEntrySerializer(data=request.data)
    if serializer.is_valid():
        diary_entry = serializer.save(user=request.user)

        das_scores = fetch_das_scores(diary_entry.id, diary_entry.content, client)
        print("DAS Scores:", das_scores)

        return Response({"message": "Entry created", "entry_id": diary_entry.id}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def retrieve_diary_entry(request, pk):
    entry = get_object_or_404(DiaryEntry, pk=pk, user=request.user)
    serializer = DiaryEntrySerializer(entry)
    return Response(serializer.data)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_diary_entry(request, pk):
    entry = get_object_or_404(DiaryEntry, pk=pk, user=request.user)
    serializer = DiaryEntrySerializer(entry, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Entry updated", "entry": serializer.data})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_diary_entry(request, pk):
    entry = get_object_or_404(DiaryEntry, pk=pk, user=request.user)
    entry.delete()
    return Response({"message": "Entry deleted"}, status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def average_das_scores(request):
    averages = DiaryEntry.objects.filter(user=request.user).aggregate(
        avg_depression=Avg("depression_score"),
        avg_anxiety=Avg("anxiety_score"),
        avg_stress=Avg("stress_score")
    )
    return Response(averages)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_entries_by_folder(request, folder_id):
    """Fetch all diary entries for a given folder, owned by the authenticated user."""
    try:
        # Ensure the folder belongs to the user
        folder = DiaryFolder.objects.get(id=folder_id, user=request.user)

        entries = DiaryEntry.objects.filter(folder=folder).values()
        return JsonResponse(list(entries), safe=False)
    except DiaryFolder.DoesNotExist:
        return JsonResponse({"error": "Folder not found or unauthorized"}, status=403)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def fetch_das_scores(request, entry_id):
    """Fetch and store DAS scores for a specific diary entry."""
    try:
        entry = DiaryEntry.objects.get(id=entry_id, folder__user=request.user)

        result = fetch_das_scores(entry.id, entry.content, client)

        if not isinstance(result, tuple) or len(result) < 2:
            return Response({"error": "Invalid API response format"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        das_scores = result[1]

        # Convert JSON string to dict if needed
        if isinstance(das_scores, str):
            das_scores = json.loads(das_scores)

        if not isinstance(das_scores, dict):
            return Response({"error": "Unexpected DAS format"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Extract and store scores
        entry.depression_score = float(das_scores.get("depression", 0))
        entry.anxiety_score = float(das_scores.get("anxiety", 0))
        entry.stress_score = float(das_scores.get("stress", 0))
        entry.save()

        return Response({
            "message": "DAS Scores fetched and saved",
            "scores": das_scores
        }, status=status.HTTP_200_OK)

    except DiaryEntry.DoesNotExist:
        return Response({"error": "Entry not found or unauthorized"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def calculate_cumulative_das(request, folder_id):
    """Calculate and store cumulative DAS scores for all entries in a folder."""
    try:
        folder = DiaryFolder.objects.get(id=folder_id, user=request.user)
        entries = DiaryEntry.objects.filter(folder=folder)

        if any(entry.content.strip() == "" for entry in entries):
            return Response(
                {"error": "All diary entries must have content before calculating cumulative scores."},
                status=status.HTTP_400_BAD_REQUEST
            )

        cumulative_depression = sum(entry.depression_score for entry in entries)
        cumulative_anxiety = sum(entry.anxiety_score for entry in entries)
        cumulative_stress = sum(entry.stress_score for entry in entries)

        folder.cumulative_depression_score = round(cumulative_depression, 2)
        folder.cumulative_anxiety_score = round(cumulative_anxiety, 2)
        folder.cumulative_stress_score = round(cumulative_stress, 2)
        folder.save()

        return Response({"message": "Cumulative DAS scores calculated and stored."}, status=status.HTTP_200_OK)

    except DiaryFolder.DoesNotExist:
        return Response({"error": "Folder not found or unauthorized"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from rest_framework.exceptions import PermissionDenied


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_diary_entry(request, entry_id):
    """Update a diary entry, unless the folder has calculated cumulative scores."""
    try:
        entry = DiaryEntry.objects.get(id=entry_id, folder__user=request.user)
        folder = entry.folder

        # Restrict editing if cumulative score is present
        if folder.cumulative_depression_score is not None:
            raise PermissionDenied("Editing is disabled after cumulative score calculation.")

        entry.content = request.data.get("content", entry.content)
        entry.save()

        return Response({"message": "Diary entry updated successfully."}, status=status.HTTP_200_OK)

    except DiaryEntry.DoesNotExist:
        return Response({"error": "Diary entry not found."}, status=status.HTTP_404_NOT_FOUND)
    except PermissionDenied as e:
        return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_user_folders(request):
    """Return all folders created by the logged-in user."""
    folders = DiaryFolder.objects.filter(user=request.user).order_by('-created_at')
    serializer = DiaryFolderSerializer(folders, many=True)
    return Response(serializer.data)
