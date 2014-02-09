import json, time, datetime
from geopy import geocoders
import dateutil.parser

class LocalLoc:
  def __init__(self):
    self.coder = geocoders.Nominatim()
    self.calls = 0;
    self.good = 0;
    try:
      self.cache = json.load(open('../data/loc.cache.json'))
    except:
      self.cache = {}

  def code(self, loc):
    self.calls += 1
    if self.calls % 1000 == 0:
      print ".",
    if loc in self.cache:
      if self.cache[loc] != []:
        self.good += 1
      return self.cache[loc]
    else:
      l = None
      try:
        l = self.coder.geocode(loc)
      except:
        time.sleep(1)
      if l != None:
        self.cache[loc] = l[1]
      else:
        self.cache[loc] = []

  def __del__(self):
    json.dump(self.cache, open('../data/loc.cache.json', 'w'))

def getUfo(line):
  try:
    return json.loads(line.strip(), strict=False)
  except Exception as e:
    return {}

ufos = [getUfo(line) for line in open('../data/ufo_awesome.json')]
empty = sum([1 if rec == {} else 0 for rec in ufos])
print "Total of ", empty, " errors reading ", len(ufos), " records."

data = []

def metaDataize(coder, record):
  # TODO(katiek): add duration converter
  # TODO(katiek): add sighted-reported lag filter
  # TODO(katiek): replace raw dates with month, year
  # TODO(tbd): add ref to file with raw text? Dump raw text? How do we want to do this?
  try:
    sighted = dateutil.parser.parse(record['sighted_at'])
    reported = dateutil.parser.parse(record['reported_at'])
    shape = record['shape']
    loc = coder.code(record['location'])
    datapos = len(data)
    data.append(record['description'])
    return [loc, sighted, reported - sighted, shape, datapos]
  except:
    return []

coder = LocalLoc()
metadata = [metaDataize(coder, record) for record in ufos if record != []]
chunks = [data[start:start+1000] for start in range(0, len(data), 1000)]

# Dump to disk.
datehandler = lambda obj: obj.isoformat() if isinstance(obj, datetime.datetime)  or isinstance(obj, datetime.date) else None
json.dump(metadata, open('../data/ufo_metadata.json', 'w'), default=datehandler)
for idx,chunk in enumerate(chunks):
  json.dump(chunk, open('../data/descriptions/ufo_data_' + str(1000*idx) + '.json', 'w'))

print coder.good, " of ", coder.calls, " items geolocated."
