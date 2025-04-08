from django.urls import path
from .views import (
    create_folder_and_entries,
    folder_entries,
    fetch_das_scores,
    calculate_cumulative_das,
    update_diary_entry,
    list_folders,
)

urlpatterns = [
    # Folder APIs
    path("api/diary/folders/create/", create_folder_and_entries, name="create_folder"),
    path("api/diary/folders/<int:folder_id>/entries/", folder_entries, name="folder_entries"),
    path("api/diary/folders/<int:folder_id>/calculate-cumulative/", calculate_cumulative_das, name="calculate_cumulative_das"),
    path("api/diary/folders/", list_folders, name="list_folders"),

    # Entry APIs
    path("api/diary/entries/<int:entry_id>/update/", update_diary_entry, name="update_entry"),
    path("api/diary/entries/<int:entry_id>/fetch-das/", fetch_das_scores
    , name="fetch_das_scores"),
]
