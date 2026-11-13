# Milestone 5A tests: voting and comments
# Run from the charcha folder:  .\tests\milestone5-tests.ps1
. "$PSScriptRoot\check.ps1"

$adminEmail = Read-Host "Admin email"
$adminPass  = Read-Host "Admin password"
$userEmail  = "priya@test.com"; $userPass = "Test1234"

Write-Host "`n---------- Setup ----------" -ForegroundColor Cyan
Check "Admin login" 200 POST /api/auth/login @{ email=$adminEmail; password=$adminPass }; $adminToken = $last.token
Check "User login"  200 POST /api/auth/login @{ email=$userEmail; password=$userPass }; $userToken = $last.token
if (-not $adminToken -or -not $userToken) { Write-Host "Login failed - stopping. Check the email/password." -ForegroundColor Red; return }
Check "Get topics" 200 GET /api/topics
$topicId = ($last.topics | Where-Object title -eq 'Cloud Computing')._id
Check "Create test post (admin)" 201 POST /api/posts @{ title="Voting and comments test post"; content="Vote and comment on me."; topic=$topicId } $adminToken
$postId = $last.post._id
Check "Get another post" 200 GET "/api/posts?limit=5"
$otherPostId = ($last.posts | Where-Object { $_._id -ne $postId } | Select-Object -First 1)._id

Write-Host "`n---------- Voting ----------" -ForegroundColor Cyan
Check "V1 vote without login" 401 POST "/api/posts/$postId/vote" @{ value=1 }
Check "V2 invalid vote value" 400 POST "/api/posts/$postId/vote" @{ value=5 } $userToken
Check "V3 user upvotes" 200 POST "/api/posts/$postId/vote" @{ value=1 } $userToken; Write-Host "      score $($last.score) (expect 1), userVote $($last.userVote) (expect 1)"
Check "V4 upvote again (no duplicate)" 200 POST "/api/posts/$postId/vote" @{ value=1 } $userToken; Write-Host "      score $($last.score) (expect 1)"
Check "V5 change to downvote" 200 POST "/api/posts/$postId/vote" @{ value=-1 } $userToken; Write-Host "      score $($last.score) (expect -1)"
Check "V6 admin upvotes" 200 POST "/api/posts/$postId/vote" @{ value=1 } $adminToken; Write-Host "      score $($last.score) (expect 0)"
Check "V7 user removes vote" 200 POST "/api/posts/$postId/vote" @{ value=0 } $userToken; Write-Host "      score $($last.score) (expect 1)"
Check "V8 vote on missing post" 404 POST "/api/posts/507f1f77bcf86cd799439011/vote" @{ value=1 } $userToken
Check "V9a userVote as admin" 200 GET "/api/posts/$postId" $null $adminToken; Write-Host "      userVote $($last.post.userVote) (expect 1)"
Check "V9b userVote as user" 200 GET "/api/posts/$postId" $null $userToken; Write-Host "      userVote $($last.post.userVote) (expect 0)"
Check "V9c userVote as guest" 200 GET "/api/posts/$postId"; Write-Host "      userVote $($last.post.userVote) (expect 0)"
Write-Host "      not marked edited: $($last.post.createdAt -eq $last.post.updatedAt) (expect True)"
Check "V10 popular feed" 200 GET "/api/posts?sort=popular&limit=1"; Write-Host "      top post is test post: $($last.posts[0]._id -eq $postId) (expect True)"

Write-Host "`n---------- Comments ----------" -ForegroundColor Cyan
Check "C1 comment without login" 401 POST /api/comments @{ postId=$postId; content="Hi" }
Check "C2 empty comment" 400 POST /api/comments @{ postId=$postId; content="   " } $userToken
Check "C3 invalid post id" 400 POST /api/comments @{ postId="123"; content="Hi" } $userToken
Check "C4 user comments" 201 POST /api/comments @{ postId=$postId; content="Great question! (top-level)" } $userToken; $c1 = $last.comment._id
Check "C5 admin replies to C4" 201 POST /api/comments @{ postId=$postId; content="Thanks! (reply)"; parentCommentId=$c1 } $adminToken; $c2 = $last.comment._id
Check "C6 user replies to C5" 201 POST /api/comments @{ postId=$postId; content="You're welcome (reply to reply)"; parentCommentId=$c2 } $userToken; $c3 = $last.comment._id
Check "C7 parent from another post" 400 POST /api/comments @{ postId=$otherPostId; content="Wrong thread"; parentCommentId=$c1 } $userToken
Check "C8 comment tree" 200 GET "/api/comments/post/$postId"
Write-Host "      total $($last.total) (expect 3), top-level $(@($last.comments).Count) (expect 1), depth-3 replies $(@($last.comments[0].replies[0].replies).Count) (expect 1)"
Check "C9 post commentCount" 200 GET "/api/posts/$postId"; Write-Host "      commentCount $($last.post.commentCount) (expect 3)"
Check "C10 user deletes admin's reply" 403 DELETE "/api/comments/$c2" $null $userToken
Check "C11 admin deletes own reply (has replies)" 200 DELETE "/api/comments/$c2" $null $adminToken; Write-Host "      softDeleted $($last.softDeleted) (expect True)"
Check "C11 tree after soft delete" 200 GET "/api/comments/post/$postId"
$middle = $last.comments[0].replies[0]
Write-Host "      middle text '$($middle.content)' (expect [deleted]), author empty: $($null -eq $middle.author) (expect True), reply kept: $(@($middle.replies).Count) (expect 1)"
Check "C12 user deletes C6 (no replies)" 200 DELETE "/api/comments/$c3" $null $userToken; Write-Host "      softDeleted $($last.softDeleted) (expect False)"
Check "C13 delete already-deleted comment" 400 DELETE "/api/comments/$c2" $null $adminToken
Check "C14 reply to deleted comment" 400 POST /api/comments @{ postId=$postId; content="Hello?"; parentCommentId=$c2 } $userToken
Check "C15 commentCount after deletes" 200 GET "/api/posts/$postId"; Write-Host "      commentCount $($last.post.commentCount) (expect 1)"

Write-Host "`n---------- Cascade delete ----------" -ForegroundColor Cyan
Check "D1 admin deletes the test post" 200 DELETE "/api/posts/$postId" $null $adminToken
Check "D2 its comments are gone" 404 GET "/api/comments/post/$postId"

Show-Summary