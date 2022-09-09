USERNAME=$1
PASSWORD=$2
MYHOST=http://localhost:3001

if [ -z $USERNAME ] || [ -z $PASSWORD ]; then
  echo "Usage: $(basename $0) <username> <password>"
  exit 1
fi

curl -Sis -X POST \
  -H "Content-Type: application/json" \
  $MYHOST/api/register \
  -d "{\"username\": \"$USERNAME\", \"password\": \"$PASSWORD\"}"

echo