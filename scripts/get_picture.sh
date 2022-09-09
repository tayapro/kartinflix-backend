ADDRESS=http://localhost:3002
ID=63138328af9500527634a2cb
#save picture to file
#curl -sS -H "Authorization: Bearer $TOKEN" $ADDRESS/picture/$ID -o pic.png
curl -isS -H "Authorization: Bearer $TOKEN" $ADDRESS/picture/$ID