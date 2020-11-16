# Homebridge RGB Light

A basic homebridge plugin used to integrate with a light exposed by an API with there required endpoints.

## Expected Light Endpoints
### Information (GET) *Required*
Should return a json object with the following fields (note if not using the brightness or colour endpoints these can be ommitted):
``` json
{
    "light": {
        "state": boolean,
        "brightness": number between 0 and 100,
        "hsv": { "h": number, "s": number, "v": number (not used)}
    }
}
```

### State (PUT) *Required*
Should expect a json body containing:
``` json
{
    "state": boolean
}
```
### Brightness (PUT) *Optional*
Should expect a json body containing:
``` json
{
    "brightness": number between 0 - 100,
}
```
### Colour (PUT) *Optional*
Should expect a json body containing:
``` json
{
    "hsv": { "h": number, "s": number, "v": number (not used)}
}
```