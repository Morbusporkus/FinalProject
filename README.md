# FinalProject
Final Project for Web-mapping 
Stack - Node.js and Express.js, PostgreSQL, Leaflet and Bootstrap
This WILL NOT WORK without my server running. If you would like to run it on your own. Let me know.
I have to setup my ngrok web portal for it work and server. Feel Free to message me at sfetter@masonlive.gmu.edu, or text/call at 571-334-6675

Aspects of the web-app

[Adding a restaurant](./adding.gif)
This takes the gps location of the user along with a review, name, and cuisine style, and sends it to the database for storage.
On server update it will then create a view from two joined tables, calculate review averages and send that as a GeoJSON to the leaflet map.

[Searching for a restaurant](./Search_function.gif)

The search function is rudamentory although it can figure out whether or not the query is either for the name or cuisine. This is all done on the front end instead of hitting the database for the new infor

[popup and filters](./clicking_restuarnt (0).gif)

Clicking on a popup will show you the name, cuisine, and reviews. You can also filter by reviews as well. When clicking on a location a dropup will show and user can add a review to it. Note: this has a bug that I need to fix, it will add multiple reviews to it. I think this is an issue with the ajax call and the form tag in my html/pug





