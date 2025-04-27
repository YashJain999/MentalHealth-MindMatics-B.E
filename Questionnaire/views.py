# views.py
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from userauth.models import User
from .models import QuestionnaireResult
from Audio.models import AudioResult
from Video.models import VideoResult
from userauth.models import PDFReport
from Diary.models import DiaryFolder, DiaryEntry
from .serializers import (
    QuestionnaireResultSerializer,
    AudioResultSerializer,
    VideoResultSerializer,
    OverAllResultSerializer
)
import json

@api_view(['POST'])
def save_results(request):
    # Extract values from the request
    email = request.data.get('email')
    depression_score = request.data.get('depression_score')
    anxiety_score = request.data.get('anxiety_score')
    stress_score = request.data.get('stress_score')

    # Basic validation to ensure email is provided
    if not email:
        return Response({'message': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Find the user by email from the user table
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'message': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    # Create a new record with the current timestamp
    print("Done")
    result = QuestionnaireResult.objects.create(
        user=user,
        time_stamp=timezone.now(),
        email=email,
        depression=depression_score,
        anxiety=anxiety_score,
        stress=stress_score
    )
    print(result)

    return Response({'message': 'Results saved successfully.'}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def combined_results(request):
    email = request.data.get('email')
    print(email)
    if not email:
        return Response({'message': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Query each table filtering by the provided email.
        questionnaire_results = QuestionnaireResult.objects.filter(email=email).values(
            'time_stamp', 'depression', 'anxiety', 'stress'
        )
        audio_results = AudioResult.objects.filter(email=email).values(
            'time_stamp', 'depression', 'anxiety', 'stress'
        )
        video_results = VideoResult.objects.filter(email=email).values(
            'time_stamp', 'depression', 'anxiety', 'stress'
        )

        # # Assuming the Report model corresponds to overallPDFs.
        overall_pdfs = PDFReport.objects.filter(email=email).values()

        user = User.objects.get(email=email)
        folders_with_scores = DiaryFolder.objects.filter(user=user).exclude(
            cumulative_depression_score__isnull=True
        ).order_by('-created_at')

        diary_results = []

        for folder in folders_with_scores:
            folder_entries = DiaryEntry.objects.filter(folder=folder).order_by('date')

            entries_list = []
            folder_depression_total = 0
            folder_anxiety_total = 0
            folder_stress_total = 0
            entry_count = 0

            for entry in folder_entries:
                if entry.depression_score is not None and entry.anxiety_score is not None and entry.stress_score is not None:
                    entries_list.append({
                        'depression': entry.depression_score,
                        'anxiety': entry.anxiety_score,
                        'stress': entry.stress_score,
                    })

                    # Calculate cumulative
                    folder_depression_total += entry.depression_score
                    folder_anxiety_total += entry.anxiety_score
                    folder_stress_total += entry.stress_score
                    entry_count += 1

            if entry_count > 0:
                diary_results.append({
                    'folder_name': folder.name,
                    'folder_timestamp': folder.created_at.strftime('%Y-%m-%d'),  # assuming folder has created_at
                    'folder_cumulative': {
                        'depression': folder_depression_total,
                        'anxiety': folder_anxiety_total,
                        'stress': folder_stress_total,
                    },
                    'entries': entries_list
                })

        print(json.dumps(diary_results, indent=2))

        
    except Exception as e:
        return Response({'message': 'Error fetching data: ' + str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # overallPDFs = [
    #     {'title': 'Comprehensive Mental Health Report - Q1 2024', 'url': '/pdfs/report1.pdf', 'date': 'March 2024'},
    #     {'title': 'Monthly Progress Summary', 'url': '/pdfs/report2.pdf', 'date': 'February 2024'},
    #     {'title': 'Year End Assessment', 'url': '/pdfs/report3.pdf', 'date': 'December 2023'},
    #     {'title': 'Quarterly Report - Q3 2023', 'url': '/pdfs/report4.pdf', 'date': 'September 2023'},
    #     {'title': 'Initial Assessment Report', 'url': '/pdfs/report5.pdf', 'date': 'July 2023'},
    # ]
    data = {
        'questionnaireResults': QuestionnaireResultSerializer(questionnaire_results, many=True).data,
        'audioResults': AudioResultSerializer(audio_results, many=True).data,
        'videoResults': VideoResultSerializer(video_results, many=True).data,
        'diaryResults': diary_results,
        'overallPDFs': OverAllResultSerializer(overall_pdfs,many=True).data,
        # 'overallPDFs': list(overall_pdfs),
    }
    print(data)
    
    return Response(data, status=status.HTTP_200_OK)

