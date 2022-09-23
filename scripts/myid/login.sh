USERNAME=$1
PASSWORD=$2
MYHOST1=https://api.tayadev.com
MYHOST=http://localhost:3001
MYHOST1=http://34.242.85.230:3001
MYHOST1=http://homyak-alb-385306616.eu-west-1.elb.amazonaws.com

if [ -z $USERNAME ] || [ -z $PASSWORD ]; then
  echo "Usage: $(basename $0) <username> <password>"
  exit 1
fi

curl -Sisk -X POST \
  -H "Content-Type: application/json" \
  $MYHOST/api/login \
  -d "{\"username\": \"$USERNAME\", \"password\": \"$PASSWORD\"}"

echo