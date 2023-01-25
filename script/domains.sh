#!/usr/bin/env bash


while read p; do
if [ ! -z "$p" ]
then
#      echo "\$var is empty"
  echo "Doing: $p"

certbot certonly --standalone -d ${p} --non-interactive --agree-tos --email aaaa@bbbb.com  --http-01-port=8888
# Renew the certificate
#certbot renew --force-renewal --tls-sni-01-port=8888

fi
done </root/domains.txt





for d in /etc/letsencrypt/live/*/ ; do
DOM=$(echo "$d" | awk -F'/' '{print $(NF-1)}' )
#'
    echo "$d $DOM"
    cat ${d}fullchain.pem ${d}privkey.pem > /etc/haproxy/ssl/${DOM}

done


# Reload  HAProxy
service haproxy reload
