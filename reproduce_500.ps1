
$baseUrl = "http://localhost:8080/api"

# 1. Login
try {
    $loginBody = @{
        google_token = "manual-test-user-token"
        role = "user"
    } | ConvertTo-Json

    $authRes = Invoke-RestMethod -Uri "$baseUrl/auth/exchange-token" -Method Post -Body $loginBody -ContentType "application/json"
    $jwt = $authRes.jwt_token
    Write-Host "Got JWT: $jwt"
} catch {
    Write-Error "Login failed: $_"
    exit
}

# 2. Create Post
try {
    $postBody = @{
        title = "Manual Test Post"
        description = "Testing 500 error"
        latitude = 33.605
        longitude = 133.6782
        genre = "food"
        images = @()
    } | ConvertTo-Json

    $headers = @{
        Authorization = "Bearer $jwt"
    }

    $postRes = Invoke-RestMethod -Uri "$baseUrl/posts" -Method Post -Body $postBody -Headers $headers -ContentType "application/json"
    Write-Host "Post created: $($postRes | ConvertTo-Json)"
} catch {
    Write-Host "Post failed with status: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Error Body: $($_.ErrorDetails.Message)"
    # Try to read stream if ErrorDetails is empty
    if (-not $_.ErrorDetails) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $body = $reader.ReadToEnd()
        Write-Host "Raw Error Body: $body"
    }
}
