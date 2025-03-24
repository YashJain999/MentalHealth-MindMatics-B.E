from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import User

class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        validators=[UniqueValidator(queryset=User.objects.all(), message="This email is already taken.")]
    )
    phone_number = serializers.CharField(
        validators=[UniqueValidator(queryset=User.objects.all(), message="This phone number is already registered.")]
    )

    class Meta:
        model = User
        fields = ['user_id', 'username', 'age', 'gender', 'email', 'phone_number', 'password', 'guardian_number']
        extra_kwargs = {"userpassword": {"write_only": True}}  # Password is write-only

    def create(self, validated_data):
        # Create the user object without saving yet
        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
            age=validated_data['age'],
            gender=validated_data['gender'],
            phone_number=validated_data['phone_number'],
            guardian_number=validated_data['guardian_number'],
        )
        # Hash and set the user's password
        user.set_password(validated_data['password'])
        # Save the user instance
        user.save()
        return user