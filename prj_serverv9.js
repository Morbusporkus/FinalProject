//NOTE: IF using NGROK, I will need to add their URL to my AJAX requests in order to not maintain functionality

//pool is used for multiple possible users
//client is used for singular
//const has lowest memory, let is middle, var is the most
// also, need to fix table problem: table is already created, maybe there is a way to premake the table? with a view maybe?
// NOTE: On the creating a temp table or a view, what if I can do it then just send it to the server when it starts up?
// That should work fine, I think. 
const express = require('express');
const app = express();
const router = express.Router();
const pg = require('pg')
const bodyParser = require('body-parser')
const geojson = require('geojson')
const {Client, Query} = require('pg')
const url = require('url');
const port = process.env.PORT || 8000
const path = require('path');
const VIEWS = path.join(__dirname, 'views');

// to get body-parse to work also, since i am using Post,i will not need url encoding, i think?
// ---server settings are here
// still learning new things! If i want to upload image to website, i will need to use
// app.use to upload it
app.set('view engine', 'pug')
app.use(express.static("D:/My_project/my_styles/pix"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const pool = new pg.Pool(
{
	user: "postgres",
	host: "localhost",
	database: "resturant_locations",
	password: "",
    port: '5432',
    connectionLimit :10
}
);

const client = new Client(
{
	user: "postgres",
	host: "localhost",
	database: "resturant_locations",
	password: "",
	port: '5432'
}
);
console.log("listening on port 8000")
//NOTE: need to add a random number gen with table name, in order to keep from having same table, error
// maybe do a pool query that will do all of the query changes?
// so i need to make a temp table, than convert to geoJson will need to use the drop the command
// to fix it.
// NOTE: create a view instead of doing the table join, will help with memory consumption
const merge_query = "CREATE VIEW prj_table AS SELECT prj_rev.average,prj_rest.name,prj_rest.geom,prj_rest.lat,prj_rest.lon,prj_rest.cuisine, prj_rest.id FROM prj_rev LEFT JOIN prj_rest ON prj_rev.id = prj_rest.id"
const geojson_convert = "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(lg.geom)::json As geometry, row_to_json((id,average,name,cuisine)) As properties FROM prj_table lg) As f) As fc";	
const average_reviews = 'UPDATE prj_rev SET average = 0; UPDATE prj_rev SET average = ((one)*1 + (two)*2 + (three)*3 + (four)*4 + (five)*5) / (one + two + three + four + five)'
// so if i understand, you use a pool with a client then this will allow for multiple users to do stuff
// and it does!
//database data converted to geojson ( i wonder if there is a better way to it?)

// learned that you need to return the client to the pool in order to keep it in the ppol


// soo it seems like, I just need to this to instantiate the view?? Might have to update it daily or something
// seems to be that there is a lot of interesting ways to do this? 
// I wonder, in my post function if I can just get it to update the view actively? 
// going to edit the merge query to add the review updates to the review table

var foo 

client.connect()
client.query(average_reviews, (err,res) =>{
	
	if(res)
	{
        console.log('averaging done')
        client.query(merge_query, (err,res)=>{
            if(res){
				
                console.log('merge done')
            }
            else{
                console.log(err)
            }
        })
    } 
    else{
        console.log(err)
    }

})

// this is a modified variant of that tutorial i had. Not sure if it will help, but it looks like it works
// node-postgress states that you need to use  a pool, and you must return the client
// as it will cause a leak, and you lose your client pool numbers
router.get('/', function(req,res,next)
{
	pool.connect()
	.then(client =>{
		
		
		 
		

			console.log('merging data into new table')
			return client
			.query(geojson_convert, (err,result)=> {
			
				if(err)
				{
					console.log(err)
				}
				console.log("converting....")
				foo = result.rows[0].row_to_json;
				client.release()
				//console.log(JSON.stringify(foo))
				res.render('prj_MainV8', {root: VIEWS,title:"test",jsonData:foo});
				console.log('done')
				
				});
		
					
		

			})
	
})
// search function?? maybe

//this is the submission and all that.
router.post('/submission', function(req,res,next){
	var id = req.body.id;
	var update_ev = req.body.review;
	var rev_coun = [id,0,0,0,0,0];
	var i;
	console.log('subbmssion recieved')
	console.log('rev score: ' + update_ev)
	for(i = 0; i < rev_coun.length; i++ ){
		if( i == update_ev){
			rev_coun[i] = 1;
		}
	}
	console.log(rev_coun)
	// note: so this might have to turn into a bunch of if statements, since SQL is somewhat limited in function for this kind of stuff.
	pool.connect()
	.then(client =>{
		return client
		.query('UPDATE prj_rev SET one = (one + ' + rev_coun[1] + '), two = (two + ' +rev_coun[2]+'),three = (three + '+rev_coun[3]+ '), four = (four + ' +rev_coun[4]+'), five = (five + ' +rev_coun[5]+') WHERE id =' + id, (err,res)=>{
			if(res){
				rev_coun = [id,0,0,0,0,0]
				client.release();
				console.log('added new review');
			}
			else{
				client.release()
				console.log(err);
			}

		})
	})



})
//this is to add a new resturant plus a review 
router.post('/update', function(req,res,next)
{   
	//again I feel like the AJAX code is not used with this.
	//I will have to see a more indepth look. Might not have to do it.

	// data from website
	console.log('here')
	var name = req.body.name;
	var food_genre = req.body.food_type;
	var lat = req.body.lat;
	var long = req.body.lng;
    var review = req.body.review - 1
    var rev_count2 = [0,0,0,0,0]
    var i;
    for(i = 0; i <= rev_count2.length; i++){
        if (i == review){
            rev_count2[i] = 1
        }
    }
	//
	pool
    .connect()
    .then(client =>{
		return client
		// adds the new restaurant into the 'restuarants table
		.query( 'INSERT INTO prj_rest(name, cuisine, lat,lon) VALUES($1,$2,$3,$4)' , [name,food_genre,lat,long], (err, res) =>
			{
				if (res)
                { 
					console.log('data inserted')
					// updates the geom of the restaurants table
                    client.query('UPDATE prj_rest SET geom = ST_SetSRID(ST_MakePoint(lon,lat),4326)', (err,res) =>{
                        if (res)
						{// for the inserting of new ratings and all that
                         // UPDATE: I switched to id as the unique id so I will not need to add geometry at all
                         // Will have to make new average table, once I get the whole thing up and running for sure
							console.log('now adding ratings')
							// inserting new reviews into the review column
							// might have to use if else statements, maybe better way?
							
							// if rating value is 1
							client.query('INSERT INTO prj_rev(one,two,three,four,five) VALUES ('+rev_count2[0]+','+rev_count2[1]+','+rev_count2[2]+','+rev_count2[3]+','+rev_count2[4]+')', (err,res) =>{
								if(res)
								{
									client.release()
                                    console.log('added new rating: '+ rev_count2)
                                    rev_count2 = [0,0,0,0,0];
								}
								else{
									console.log(err)
								}
								})

							
							
                            
                        }
                        else{
                            console.log(err)
                        }
                    }
					)
					
                }
                else
                {
                    console.log(err)
                }
			})	
       
		
        })
    .catch(e => console.log(e.stack))
    
    
});
app.listen(port);
app.use('/', router);
