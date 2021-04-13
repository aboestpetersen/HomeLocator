# Web App Helping Homebuyers Locate Suitable Areas
Repository for Spring 2021 semester geoinformatics project for building a real estate web GIS application.

#### Run App Locally:
1. Open Command Prompt/Terminal.
2. Set directory.
```
cd new-project
```
3. Initiate local host.
```
npm start
```
4. Navigate to http://localhost:1234 (or wherever NPM tells you navigate to).

#### Progress Notes:
* Added Municipalities boundaries from GitHub (NOT GML, couldn't get that working...). -22.03.2021 ABP
    * Added "Home" button to return user to default extent as well as a scaleline. -ABP
    * Added navigation bar at the top, the buttons don't do anything yet. -ABP
    * Cleaned navigation bar, added structure to files, and enabled "About" button so it loads a page now. -ABP
    * Added DK boundary & labels. Search bar has been added but doesn't do anything yet. -ABP
    * Now layers are scale dependent, renders depend on zoom level. -ABP
* Revised Home Button, added search for address functionality using OSM Geocoder. -23.03.21 ABP
    * Added cities from GitHub, need to clip them to Denmark -MLT
    * Tried to display features from OSM as GeoJSON files, for some reason they're not showing up. The updated
code is here (index.js). Added the OSM GeoJSON files here- MLT
    * Began Search Criteria Panel. -ABP
* LayerSwitcher added. -09.04.2021 ABP
* Added Basemap options and fullscreen button. -11.04.2021 ABP

### Data Processing- MLT: 

Most of the features in OSM are divided into a points layer and a polygons layer within the same feature (e.g.
schools). In order to have only one layer for each feature:

1) Selected by Location (Intersect both layers)
2) Switched selection in the attribute table of Points layer, selecting points that do not intersect with polygons
3) Created a new points layer from 2)
4) Buffered the points in layer in 2) - 0.5 m buffer
5) Merged buffered points layer in 4) .shp with the polygons .shp = final .shp
6) Converted .shp to .geojson file

OSM Layers that we have so far: universities, schools, leisure parks and hospitals (projection EPSG: 4326- WGS 84)

Sample of app so far:
[Image of App Progress](images/app_progress.png)
