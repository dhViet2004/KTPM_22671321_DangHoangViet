import os

app_env = os.getenv('APP_ENV', 'unknown')

print(f"----------------------------------------")
print(f"Ứng dụng đang chạy trong môi trường: {app_env}")
print(f"Chào Việt! Chúc bạn làm Lab Docker vui vẻ.")
print(f"----------------------------------------")