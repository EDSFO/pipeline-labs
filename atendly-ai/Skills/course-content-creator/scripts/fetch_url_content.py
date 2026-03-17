#!/usr/bin/env python3
"""
Fetch content from URLs using various methods.
Supports documentation, articles, videos, and more.
"""

import sys
import argparse
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse

def fetch_html_content(url):
    """Fetch and extract text content from HTML pages."""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')

        # Remove script and style elements
        for script in soup(["script", "style", "nav", "footer", "header"]):
            script.decompose()

        # Get text
        text = soup.get_text(separator='\n', strip=True)

        # Get title
        title = soup.title.string if soup.title else "No title"

        return {
            'title': title,
            'content': text,
            'url': url
        }
    except Exception as e:
        return {
            'error': str(e),
            'url': url
        }

def main():
    parser = argparse.ArgumentParser(description='Fetch content from URLs')
    parser.add_argument('url', help='URL to fetch content from')
    parser.add_argument('--output', '-o', help='Output file (default: stdout)')

    args = parser.parse_args()

    result = fetch_html_content(args.url)

    if 'error' in result:
        print(f"Error fetching {result['url']}: {result['error']}", file=sys.stderr)
        sys.exit(1)

    output = f"# {result['title']}\n\nSource: {result['url']}\n\n{result['content']}"

    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(output)
        print(f"Content saved to {args.output}")
    else:
        print(output)

if __name__ == '__main__':
    main()
