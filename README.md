# Homebridge RGB Light

A basic homebridge plugin used to integrate with a light exposed by an API with there required endpoints.

## Expected Light Endpoints
### Information (GET) *Required*
Should return a json object with the following fields (note if not using the brightness or colour endpoints these can be ommitted):
``` json
{
    "light": {
        "switch": 0 or 1,
        "brightness": number between 0 and 1,
        "hsv": { "h": number, "s": number, "v": number (not used)}
    }
}
```

### Switch (PUT) *Required*
Should expect a json body containing:
``` json
{
    "switch": 0 or 1
}
```
### Brightness (PUT) *Optional*
Should expect a json body containing:
``` json
{
    "brightness": number between 0 and 1,
}
```
### Colour (PUT) *Optional*
Should expect a json body containing:
``` json
{
    "hsv": { "h": number, "s": number, "v": number (not used)}
}
```