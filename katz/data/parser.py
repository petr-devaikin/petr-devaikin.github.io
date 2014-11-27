#!/usr/bin/python
# -*- coding: utf-8 -*-

from datetime import datetime
from dateutil import relativedelta as rdelta
import json

ages = {}

f = open('date-sum-bd-gender.csv')
for line in f:
    data = line.split(';')
    if data[2]:
        money = int(data[1])
        oper = datetime.strptime(data[0], '%m/%d/%Y')
        bd = datetime.strptime(data[2], '%m/%d/%Y') if '/' in data[2] else datetime.strptime(data[2], '%d.%m.%Y')
        age = int(rdelta.relativedelta(oper ,bd).years)
        if not age in ages:
            ages[age] = {
                'age': age,
                'all': 0,
                'male': 0,
                'female': 0
            }
        ages[age]['all'] += money
        if int(data[3]) == 1:
            ages[age]['male'] += money
        else:
            ages[age]['female'] += money

for k in range(min(ages.keys()), max(ages.keys())):
    if not k in ages:
        ages[k] = {
            'age': k,
            'all': 0,
            'male': 0,
            'female': 0
        }

result = [ages[age] for age in ages]

nf = open('date-sum-bd-gender-result.js', 'w')
nf.write('var genderData = ' + json.dumps(result) + ';')