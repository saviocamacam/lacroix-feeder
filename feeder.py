import json

if __name__ == '__main__':
    with open('cm.json', encoding='utf-8') as data_file:
        data = json.load(data_file)
        print(data)
