ADDRESS=http://localhost:3002
ADDRESS1=http://34.246.190.40:3002
PIC1=$(cat assets/hryusha_base64.txt)
PIC2=$(cat assets/pic.png | base64)
PIC=$(cat assets/hryusha.jpeg | base64)
TYPE=JPEG
printf '%s' "{\"pict\": \"$PIC\",\"imgtype\": \"$TYPE\"}" > pictWithURL
#curl -isS -H "Content-Type: application/json; charset=utf-8" -X POST $ADDRESS/picture -d "{\"pict\": \"$PIC\"}"
curl -isS -H "Content-Type: application/json; charset=utf-8" -H "Authorization: Bearer $TOKEN" -X POST $ADDRESS/picture -d @pictWithURL