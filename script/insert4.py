#!/bin/python3
import csv
import sys
import random
import string
from urllib.parse import quote
from pymongo import MongoClient

def generate_alphanumeric_string(string_length):
    digits_and_lowercase = string.digits + string.ascii_lowercase
    return ''.join(random.choice(digits_and_lowercase) for i in range(string_length))


def parse_csv(file):
    outfile=sys.argv[1].split('.')[0]+"_ShortenURL.csv"
    #outfilesql="/tmp/"+sys.argv[1].split('.')[0]+"_ShortenURL.csv.sql"
    outcsv = open(outfile,mode='w')
    #outsql = open(outfilesql,mode='w')
    client = MongoClient("mongodb://localhost:27017/")
    db = client["short"]
    collection = db["urls"]
    rows=1
    data=[]
    insertat=1000

    with open(file, newline='', encoding='utf-8') as csvfile:
        csvreader = csv.reader(csvfile)
        for row in csvreader:
            random=generate_alphanumeric_string(10)
            turl=row[4].replace(" ", "%20").replace("'", "%27")
            #url=quote(row[4])
            newdoc = {
               "slug": random   ,
               "url": turl
            }
            data.append(newdoc)
            if rows % insertat ==0:
               #print(data)
               collection.insert_many(data)
               data=[]
#            result = collection.insert_one(newdoc)
#            if not result.acknowledged:
#               print("Error inserting document")
            #print(row[4] )
            #print(  "insert into links ( pixels_ids,  user_id,domain_id, type, url,  location_url, settings , datetime) values ( '[]',  1, ( select domain_id from domains where host= '"+row[3]+"' )   ,'link' , '"+random+"', '"+turl+"' , '{\"clicks_limit\":null,\"expiration_url\":\"\",\"password\":null,\"sensitive_content\":false,\"targeting_type\":\"false\"}' , '2023-01-01 11:11:11' ); "      )
            #outsql.write(  "insert into links ( pixels_ids,  user_id,domain_id, type, url,  location_url, settings , datetime) values ( '[]',  1, ( select domain_id from domains where host= '"+row[3]+"' )   ,'link' , '"+random+"', '"+turl+"' , '{\"clicks_limit\":null,\"expiration_url\":\"\",\"password\":null,\"sensitive_content\":false,\"targeting_type\":\"false\"}' , '2023-01-01 11:11:11' );\n"      )
            outcsv.write( row[0]+","+row[1]+"," + row[2]+","    +row[3]+"/"+random+"\n")
            rows=rows+1;
    outcsv.close()
    collection.insert_many(data)
    print('Rows count:',rows-1)

#    print(data)

#    result = bulk.execute()
#    print(result)
    #outsql.close()

print('Doing ',sys.argv[1]);
parse_csv(sys.argv[1])


