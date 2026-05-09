@echo off
chcp 65001 >nul
echo ================================================
echo    UserService API Test Script
echo ================================================
echo.

set BASE_URL=http://localhost:8081
set TOKEN_FILE=token.txt

echo [1] Testing Register API...
echo -----------------------------------------------
curl -X POST "%BASE_URL%/api/v1/users/register" ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"testuser\",\"email\":\"testuser@example.com\",\"password\":\"password123\",\"firstName\":\"Test\",\"lastName\":\"User\",\"phoneNumber\":\"0912345678\"}" ^
  -s -o response_register.json

echo Response:
type response_register.json
echo.

:: Extract token from response
for /f "tokens=*" %%a in ('powershell -Command "(Get-Content response_register.json | ConvertFrom-Json).data.token" 2^>nul') do set TOKEN=%%a
echo Token extracted: %TOKEN%
echo %TOKEN% > %TOKEN_FILE%
echo.

echo [2] Testing Login API...
echo -----------------------------------------------
curl -X POST "%BASE_URL%/api/v1/users/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"testuser\",\"password\":\"password123\"}" ^
  -s -o response_login.json

echo Response:
type response_login.json
echo.

:: Update token from login
for /f "tokens=*" %%a in ('powershell -Command "(Get-Content response_login.json | ConvertFrom-Json).data.token" 2^>nul') do set TOKEN=%%a
echo Updated Token: %TOKEN%
echo %TOKEN% > %TOKEN_FILE%
echo.

echo [3] Testing Get Profile API (with JWT)...
echo -----------------------------------------------
curl -X GET "%BASE_URL%/api/v1/users/profile" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -s

echo.
echo.

echo [4] Testing Get Profile API (without JWT - should fail)...
echo -----------------------------------------------
curl -X GET "%BASE_URL%/api/v1/users/profile" ^
  -s

echo.
echo.

echo [5] Testing Register with duplicate username (should fail)...
echo -----------------------------------------------
curl -X POST "%BASE_URL%/api/v1/users/register" ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"testuser\",\"email\":\"another@example.com\",\"password\":\"password123\"}" ^
  -s

echo.
echo.

echo [6] Testing Login with wrong password (should fail)...
echo -----------------------------------------------
curl -X POST "%BASE_URL%/api/v1/users/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"testuser\",\"password\":\"wrongpassword\"}" ^
  -s

echo.
echo.

:: Cleanup
if exist response_register.json del response_register.json
if exist response_login.json del response_login.json

echo ================================================
echo    Test Complete!
echo ================================================
pause
