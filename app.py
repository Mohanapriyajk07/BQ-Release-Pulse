import os
import re
import requests
import xml.etree.ElementTree as ET
from flask import Flask, render_template, jsonify

app = Flask(__name__)

FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"

def fetch_and_parse_feed():
    try:
        response = requests.get(FEED_URL, timeout=10)
        response.raise_for_status()
        
        # Parse XML
        root = ET.fromstring(response.content)
        ns = {'atom': 'http://www.w3.org/2005/Atom'}
        
        feed_title = root.find('atom:title', ns).text if root.find('atom:title', ns) is not None else "BigQuery Release Notes"
        feed_updated = root.find('atom:updated', ns).text if root.find('atom:updated', ns) is not None else ""
        
        entries = []
        for entry in root.findall('atom:entry', ns):
            date_str = entry.find('atom:title', ns).text
            updated = entry.find('atom:updated', ns).text if entry.find('atom:updated', ns) is not None else ""
            
            link_elem = entry.find("atom:link[@rel='alternate']", ns)
            link_url = link_elem.attrib['href'] if link_elem is not None else ""
            
            content_elem = entry.find('atom:content', ns)
            content_html = content_elem.text if content_elem is not None else ""
            
            # Split the HTML content into individual release note items based on <h3>
            pattern = r'<h3>(.*?)</h3>(.*?)(?=<h3>|$)'
            matches = re.findall(pattern, content_html, re.DOTALL)
            
            if not matches:
                # If there are no <h3> headings, treat the entire content as one update
                entries.append({
                    'id': entry.find('atom:id', ns).text if entry.find('atom:id', ns) is not None else "",
                    'date': date_str,
                    'updated': updated,
                    'link': link_url,
                    'type': 'Update',
                    'content': content_html.strip()
                })
            else:
                for idx, (heading, body) in enumerate(matches):
                    entry_id = entry.find('atom:id', ns).text if entry.find('atom:id', ns) is not None else ""
                    sub_id = f"{entry_id}#{idx}"
                    
                    entries.append({
                        'id': sub_id,
                        'date': date_str,
                        'updated': updated,
                        'link': link_url,
                        'type': heading.strip(),
                        'content': body.strip()
                    })
                    
        return {
            'success': True,
            'title': feed_title,
            'updated': feed_updated,
            'entries': entries
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/releases')
def get_releases():
    data = fetch_and_parse_feed()
    return jsonify(data)

if __name__ == '__main__':
    # Bind to 127.0.0.1 and port 5000
    app.run(debug=True, host='127.0.0.1', port=5000)
