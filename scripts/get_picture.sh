ADDRESS=http://34.242.85.230:3002
ID=63138dcd4ae4eedda059e207
#save picture to file
#curl -sS -H "Authorization: Bearer $TOKEN" $ADDRESS/picture/$ID -o pic.png
curl -isS -H "Authorization: Bearer $TOKEN" $ADDRESS/picture/$ID