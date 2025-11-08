import csv
import random
from typing import List, Optional, Dict
from pathlib import Path
from urllib.parse import urlparse

class Proxy:
    def __init__(self, ip: str, port: str, protocol: str, up_time: float = 0.0, latency: int = 0):
        self.ip = ip.strip('"')
        self.port = port.strip('"')
        self.protocol = protocol.strip('"').lower()
        self.up_time = float(up_time) if up_time else 0.0
        self.latency = int(latency) if latency else 0
        self.url = f"{self.protocol}://{self.ip}:{self.port}"
    
    def __repr__(self):
        return f"Proxy({self.protocol}://{self.ip}:{self.port}, uptime={self.up_time}%, latency={self.latency}ms)"


class ProxyManager:
    def __init__(self, proxy_file: str = "Free_Proxy_List (1).txt"):
        self.proxies: List[Proxy] = []
        self.proxy_file = proxy_file
        self.load_proxies()
    
    def load_proxies(self):
        """Load proxies from CSV file"""
        try:
            # Try to find the file in the backend directory or project root
            proxy_paths = [
                Path(__file__).parent.parent / self.proxy_file,
                Path(__file__).parent.parent.parent / self.proxy_file,
                Path(self.proxy_file),
            ]
            
            proxy_path = None
            for path in proxy_paths:
                if path.exists():
                    proxy_path = path
                    break
            
            if not proxy_path:
                print(f"Warning: Proxy file '{self.proxy_file}' not found. Proxies will not be used.")
                return
            
            with open(proxy_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    try:
                        # Handle multiple protocols (take the first one)
                        protocols = row.get('protocols', '').strip('"')
                        protocol = protocols.split(',')[0] if protocols else 'http'
                        
                        # Only support http, socks4, socks5
                        if protocol not in ['http', 'socks4', 'socks5']:
                            continue
                        
                        proxy = Proxy(
                            ip=row.get('ip', ''),
                            port=row.get('port', ''),
                            protocol=protocol,
                            up_time=row.get('upTime', '0'),
                            latency=row.get('latency', '0')
                        )
                        
                        # Only add proxies with reasonable uptime (>50%)
                        if proxy.up_time >= 50:
                            self.proxies.append(proxy)
                    except Exception as e:
                        print(f"Error parsing proxy row: {e}")
                        continue
            
            # Sort by uptime (descending) and latency (ascending)
            self.proxies.sort(key=lambda p: (-p.up_time, p.latency))
            print(f"Loaded {len(self.proxies)} proxies from {proxy_path}")
            
        except Exception as e:
            print(f"Error loading proxies: {e}")
            self.proxies = []
    
    def get_best_proxy(self, protocol: Optional[str] = None) -> Optional[Proxy]:
        """Get the best available proxy, optionally filtered by protocol"""
        if not self.proxies:
            return None
        
        if protocol:
            filtered = [p for p in self.proxies if p.protocol == protocol.lower()]
            if filtered:
                return filtered[0]
        
        return self.proxies[0]
    
    def get_random_proxy(self, protocol: Optional[str] = None) -> Optional[Proxy]:
        """Get a random proxy, optionally filtered by protocol"""
        if not self.proxies:
            return None
        
        if protocol:
            filtered = [p for p in self.proxies if p.protocol == protocol.lower()]
            if filtered:
                return random.choice(filtered)
        
        return random.choice(self.proxies)
    
    def get_proxy_for_url(self, url: str) -> Optional[Proxy]:
        """Get an appropriate proxy for a given URL"""
        parsed = urlparse(url)
        # Prefer HTTP proxies for HTTP/HTTPS URLs
        if parsed.scheme in ['http', 'https']:
            # Try HTTP first, then SOCKS5, then SOCKS4
            for protocol in ['http', 'socks5', 'socks4']:
                proxy = self.get_best_proxy(protocol=protocol)
                if proxy:
                    return proxy
        
        return self.get_best_proxy()
    
    def get_proxy_config(self, proxy: Optional[Proxy] = None) -> Dict:
        """Get proxy configuration for httpx"""
        if not proxy:
            proxy = self.get_best_proxy()
        
        if not proxy:
            return {}
        
        if proxy.protocol == 'http':
            return {
                "http://": f"http://{proxy.ip}:{proxy.port}",
                "https://": f"http://{proxy.ip}:{proxy.port}",
            }
        elif proxy.protocol in ['socks4', 'socks5']:
            # For SOCKS proxies, we'll need httpx-socks
            return {
                "proxy": f"{proxy.protocol}://{proxy.ip}:{proxy.port}"
            }
        
        return {}

