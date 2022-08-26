ADDRESS=http://localhost:3002
PIC=$(cat spongebob_base64.txt)
TYPE=PNG
printf '%s' "{\"pict\": \"$PIC\",\"imgtype\": \"$TYPE\"}" > pictWithURL
#curl -isS -H "Content-Type: application/json; charset=utf-8" -X POST $ADDRESS/picture -d "{\"pict\": \"$PIC\"}"
curl -isS -H "Content-Type: application/json; charset=utf-8" -X POST $ADDRESS/picture -d @pictWithURL