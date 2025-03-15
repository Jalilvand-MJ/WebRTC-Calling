# WebRTC-Calling
IUST Internet Engineering course final project / Fall 2024

# Run
Build code and run on your machine using
```
    docker compose up
```
then, open `localhost` in your browser.  
Peers on the local network can connect and chat, but due to browser privacy restrictions, video sharing is not allowed over HTTP. This limitation can be overcome by using an HTTPS proxy, for example:
```
    npx local-ssl-proxy --source 443 --target 80
```
