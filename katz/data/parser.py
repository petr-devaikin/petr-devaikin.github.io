#!/usr/bin/python
# -*- coding: utf-8 -*-

from datetime import datetime, date, timedelta
from dateutil import relativedelta as rdelta
import json
import random

ages = {}

timeline = {}

d = date(2014, 7, 22)
while d < date(2014, 9, 9):
    timeline[d] = {
        'day': d.day,
        'month': d.month,
        'sum': 0,
        'donates': []
    }
    d += timedelta(days=1)

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
                'sum': 0,
                'count': 0,
                'male': {
                    'sum': 0,
                    'count': 0,
                },
                'female':  {
                    'sum': 0,
                    'count': 0,
                },
            }
        ages[age]['sum'] += money
        ages[age]['count'] += 1
        if int(data[3]) == 1:
            ages[age]['male']['sum'] += money
            ages[age]['male']['count'] += 1
        else:
            ages[age]['female']['sum'] += money
            ages[age]['female']['count'] += 1

        timeline[oper.date()]['sum'] += money
        timeline[oper.date()]['donates'].append({
                'sum': money,
                'male': int(data[3]) == 1
            })


for k in range(min(ages.keys()), max(ages.keys())):
    if not k in ages:
        ages[k] = {
            'age': k,
            'sum': 0,
            'male': {
                'sum': 0,
                'count': 0,
            },
            'female':  {
                'sum': 0,
                'count': 0,
            },
            'count': 0,
        }

result = [ages[age] for age in ages]
result_tl = [timeline[t] for t in timeline]
result_tl = sorted(result_tl, key=lambda d: d['month'] * 100 + d['day'])
for r in result_tl:
    random.shuffle(r['donates'])

nf = open('date-sum-bd-gender-result.js', 'w')
nf.write('var genderData = ' + json.dumps(result) + ';')

nf = open('tl-data.js', 'w')
nf.write('var timelineData = ' + json.dumps(result_tl) + ';')