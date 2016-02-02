/**
 *   Gen-O-Mix Pages Routing script
 *   Copyright (C) 2016  Aurélien VALADE <wolvi.lataniere@gmail.com>
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 **/
var express = require('express');
var router = express.Router();
var config = require('../config.json');
var lang=require('../public'+config.public.lang_file);

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {config: config, lang: lang });
});

/* Generate the Configuration from "public" part of the configuration file */
router.get('/config.json', function(req, res){
  res.json(config.public);
});

/* First generation creation */
router.get('/first_generation', function(req, res){
    var supported_colors = req.query.colors;
    var generation_pool = req.query.pool;

    var Specimen=require('./genomic');

    console.log('Supported colors:'+req.query.colors);
    var colors_count = supported_colors.length;

    generation=[];

    for (var i=0;i<generation_pool;i++)
    {
	//color_idx=Math.floor(Math.random() * colors_count);
	color_idx = Math.floor(colors_count * i / generation_pool);
	color = supported_colors[color_idx];
	generation[i] = new Specimen(0, color);
    }

    res.json(generation);
});


/* Each next generation */
router.get('/next_gen', function(req, res){
    var generation_pool = req.query.pool;
    var supported_colors = req.query.colors;
    var colors_count=supported_colors.length;
    var Specimen=require('./genomic');

    generation=[];

    parents = JSON.parse(req.query.jsonData)

    active_parents = [];

    for (var i=0;i<parents.length;i++)
    {
	if (parents[i].is_active)
	{
	    active_parents.push(parents[i]);
	}
    }
    console.log('Active parents count: '+active_parents.length+"\n");

    console.log('Parents count:'+generation_pool+'\n');

    for (var i=0;i<generation_pool;i++)
    {
	father_idx = Math.floor(Math.random() * active_parents.length);

	rnd = Math.floor(Math.random() * 100);

	do{
	    mother_idx = Math.floor(Math.random() * active_parents.length);
	}while(mother_idx == father_idx);

	if (rnd >= req.query.mutationRate)
	{
	    generation.push(new Specimen(active_parents[father_idx].generation, active_parents[father_idx], active_parents[mother_idx]));
	}
	else
	{
	    color_idx=Math.floor(Math.random() * colors_count);
	    color = supported_colors[color_idx];
	    console.log('Mutation of '+i+' with color '+color+'\n');
	    generation.push(new Specimen(active_parents[father_idx].generation, color));
	}
    }

    res.json(generation);
});

module.exports = router;
