import bleach
from bleach.css_sanitizer import CSSSanitizer
from typing import Dict

ALLOWED_TAGS = [
    'a', 'abbr', 'acronym', 'address', 'area', 'article', 'aside', 'b', 'bdi', 'bdo',
    'big', 'blockquote', 'br', 'button', 'canvas', 'caption', 'center', 'cite', 'code',
    'col', 'colgroup', 'dd', 'del', 'details', 'dfn', 'dialog', 'dir', 'div', 'dl', 'dt',
    'em', 'embed', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form', 'h1',
    'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'i', 'img', 'input', 'ins', 'kbd',
    'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'menu', 'menuitem', 'meter',
    'nav', 'ol', 'optgroup', 'option', 'output', 'p', 'pre', 'progress', 'q', 'rp', 'rt',
    'ruby', 's', 'samp', 'section', 'select', 'small', 'source', 'span', 'strike',
    'strong', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot',
    'th', 'thead', 'time', 'title', 'tr', 'track', 'tt', 'u', 'ul', 'var', 'video',
    'wbr'
]

ALLOWED_ATTRIBUTES = {
    '*': ['class', 'id', 'style', 'title', 'lang', 'dir'],
    'a': ['href', 'target', 'rel', 'name'],
    'img': ['src', 'alt', 'width', 'height', 'loading'],
    'link': ['href', 'rel', 'type'],
    'form': ['action', 'method'],
    'input': ['type', 'name', 'value', 'placeholder', 'checked', 'disabled'],
    'textarea': ['name', 'rows', 'cols', 'placeholder'],
    'select': ['name'],
    'option': ['value'],
    'video': ['src', 'width', 'height', 'controls', 'autoplay', 'loop', 'muted'],
    'source': ['src', 'type'],
    'iframe': ['src', 'width', 'height', 'frameborder', 'allowfullscreen', 'sandbox'],
    'style': ['type'],
}

ALLOWED_STYLES = [
    'color', 'background-color', 'background', 'font-size', 'font-family',
    'font-weight', 'text-align', 'text-decoration', 'margin', 'padding',
    'border', 'width', 'height', 'display', 'position', 'top', 'left',
    'right', 'bottom', 'z-index', 'opacity', 'visibility'
]

css_sanitizer = CSSSanitizer(allowed_css_properties=ALLOWED_STYLES)

def sanitize_html(html: str, base_url: str = "") -> Dict[str, str]:
    if not html:
        return {"html": "", "title": ""}
    
    try:
        sanitized = bleach.clean(
            html,
            tags=ALLOWED_TAGS,
            attributes=ALLOWED_ATTRIBUTES,
            css_sanitizer=css_sanitizer,
            strip=True
        )
        
        if base_url:
            sanitized = sanitized.replace('href="/', f'href="{base_url}/')
            sanitized = sanitized.replace("href='/", f"href='{base_url}/")
            sanitized = sanitized.replace('src="/', f'src="{base_url}/')
            sanitized = sanitized.replace("src='/", f"src='{base_url}/")
        
        title_match = None
        if '<title>' in html.lower():
            import re
            title_pattern = r'<title[^>]*>(.*?)</title>'
            title_match = re.search(title_pattern, html, re.IGNORECASE | re.DOTALL)
        
        title = title_match.group(1).strip() if title_match else ""
        title = bleach.clean(title, tags=[], strip=True)
        
        return {
            "html": sanitized,
            "title": title
        }
    except Exception as e:
        return {
            "html": f"<html><body><p>Error sanitizing content: {str(e)}</p></body></html>",
            "title": "Error"
        }

