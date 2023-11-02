import binascii
import sys
import time
import uuid
import hashlib
import hmac
import base64
import re
import json
import unicodedata
from datetime import datetime
import urllib
import re

url = 'DebitCardService/getDetail'
challenge = [
    52, 170, 27, 82, 9, 160, 131, 35, 96, 16, 68, 234, 13, 42, 254, 125, 220, 175, 63, 171, 240, 253, 41, 212, 191, 173, 0, 98, 12, 198, 31, 55
]
index = 14
body = '{"cardId":1}'.encode('utf-8')
expected_concatenated_data = [52, 170, 27, 82, 9, 160, 131, 35, 96, 16, 68, 234, 13, 42, 254, 125, 220, 175, 63, 171, 240, 253, 41, 212, 191, 173, 0, 98, 12, 198, 31, 55, 68, 101, 98, 105, 116, 67, 97, 114, 100, 83, 101, 114, 118, 105, 99, 101, 47, 103, 101, 116, 68, 101, 116, 97, 105, 108, 10, 123, 34, 99, 97, 114, 100, 73, 100, 34, 58, 49, 125
                              ]
key = 'ee2d9b2af15fc0c2ad5602fe0368d1eae2616165d1bb951cfaef7b172f501ef8'


url = [ord(char) for char in url]
data = challenge
data.extend(url)
data.append(10)
data.append(123)
data.extend(body[1:-1])
data.append(125)

# print(challenge)
# print(url)
# print([ord(byte) for byte in body][1:-1])

# print(data, len(data))

ecpected = 'Authorization: TBMobile 14 ogDyTVipp3sDIzhCFeQhF+MZrvKXKWh2u7rplibjCe4='


key = 'ee2d9b2af15fc0c2ad5602fe0368d1eae2616165d1bb951cfaef7b172f501ef8'.encode('utf-8')
# data = [52, 170, 27, 82, 9, 160, 131, 35, 96, 16, 68, 234, 13, 42, 254, 125, 220, 175, 63, 171, 240, 253, 41, 212, 191, 173, 0, 98, 12, 198, 31, 55, 68, 101, 98, 105, 116, 67, 97, 114, 100, 83, 101, 114, 118, 
# 105, 99, 101, 47, 103, 101, 116, 68, 101, 116, 97, 105, 108, 10, 123, 34, 99, 97, 114, 100, 73, 100, 34, 58, 49, 125]
key_bytes = binascii.unhexlify(key)
digest = hmac.new(key_bytes, bytes(data), hashlib.sha256).hexdigest()
print(key_bytes, digest)
# Yn = base64.b64encode(xn.digest()).strip()
# print(Yn)
# print(ecpected)
