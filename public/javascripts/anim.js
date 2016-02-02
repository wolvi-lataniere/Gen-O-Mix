/**
 *  @brief Gen-O-Mix Animation engine
 *  @author "Aurelien VALADE"<wolvi.lataniere@gmail.com>
 *  @date Jan 2016
 *  @license GNU GPLv3
 *
 *   Gen-O-Mix Animation Engine
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



var random_rate = 0;
var generation_population=[];
var current_gen = 0;
var generation = [];
var colors='RGBCMY';
var series_colors=["#FF0000", "#00FF00", "#0000FF","#00FFFF", "#FF00FF", "#FFFF00"];
var last_gen=200;
var anim_timer;

var config;
var lang_data;
/**
 @brief Startup function
*/
$(function(){
    /* Load configuration */
    $.getJSON("/config.json",
	      function(data)
	      {
		  config = data;
		  
		  $.getJSON(config.lang_file,
			    function(data)
			    {
				lang_data=data;
				$('#batch_size').val(config.default_generations_count);
				$('#pool_size').val(config.default_elements_by_gen);
				$('#random_mut').attr('checked',config.default_random_active);
				$('#random_rate').val(config.default_random_rate);
				$('#mutation_rate_selection').hide();
				clear_graph();
			    });
	      });

    
    /* Update graph from data */
    clear_graph = function()
    {
	p=$.jqplot('chartdiv', [[[0,0]],[[0,0]],[[0,0]]],{
	    title:lang_data.graphic.title,
	    axes:{
		xaxis:{
		    label:lang_data.graphic.xtitle
		},
		yaxis:{
		    label:lang_data.graphic.ytitle
		}
	    }
	});
	p.replot();
    }

    update_graph = function()
    {
	var data=[];
	
	for (var i=0;i<colors.length;i++)
	{
	    dt=[];
	    $.each(generation_population, function(idx, item)
		   {
		       dt.push([item.generation, item.population[colors[i]]]);
		   });
	    data.push(dt);
	}
	
	p=$.jqplot('chartdiv', data,{
	    title:lang_data.graphic.title,
	    seriesColors:series_colors,
	    axes:{
		xaxis:{
		    label:lang_data.graphic.xtitle
		},
		yaxis:{
		    label:lang_data.graphic.ytitle
		}
	    }
	});

	p.replot();
    }

    //
    anim_timer = $.timer(function(){
	if (current_gen >= last_gen)
	{
	    anim_timer.pause();
	}
	$("#next").click();
    },1000);

    $("#rewind").click(function()
		       {
			   anim_timer.pause();
			   current_gen=0;
			   generation_population=[];
			   $("#play").attr('src',config.site_prefix+"images/fast_forward.png");
			   $("#play").attr('alt', lang_data.start_auto);
			   $("#animation").text("");
			   $("#generation_num").text("0");
			   clear_graph();
		       });
    
    //
    $("#play").click(function(){
	if (anim_timer.isActive)
	{
	    anim_timer.pause();
	    $("#play").attr('src',config.site_prefix+"images/fast_forward.png");
	    $("#play").attr('alt', lang_data.start_auto);
	}
	else
	{
	    last_gen = $('#batch_size').val();
	    anim_timer.play();
	    $("#play").attr('src',config.site_prefix+"images/pause.png");
	    $("#play").attr('alt', lang_data.pause_auto);
	}
    });
    
    $("#next").click(function(){
	if (current_gen == 0)
	{
	    $.ajax({type:'GET', datatype:'JSON', url:config.site_prefix+'first_generation', data:{
 		colors:colors,
		pool:$('#pool_size').val()
	    }, dataType:'json',
		    success:function(data)
		    {
			update_with_generation(data);
			generation=data;
			update_graph();
		    }
		   });
	}
	else
	{
	    $.ajax({type:'GET', url:config.site_prefix+'next_gen',
		    data:{
			colors:colors,
			pool:$('#pool_size').val(),
			mutationRate:random_rate,
			jsonData:JSON.stringify(generation)},
		    dataType:'json',
		    success:function(data)
		    {
			update_with_generation(data);
			generation=data;
			update_graph();
		    }});
	}

	document.getElementById("generation_num").innerHTML = current_gen;

	current_gen++;
    });
    

    activate=function(i){
	if (generation[i].is_active)
	{
	    document.getElementById('blob'+i).style.opacity = 0.2;
	    generation[i].is_active = false;
	}
	else
	{
	    document.getElementById('blob'+i).style.opacity=1;
	    generation[i].is_active = true;
	}
    };
    
});

/* Handle hide/show of the mutation rate elements */
show_hide_mutationrate = function(value)
{
    random_active = value;
    if (value)
    {
	$('#mutation_rate_selection').fadeIn();
	random_rate=document.getElementById('random_rate').value;
    }
    else
    {
	$('#mutation_rate_selection').fadeOut();
	random_rate = 0;
    }
}

/* Update the mutation rate display */
update_mutation_rate = function(value)
{
    random_rate = value;
    $("#mutation_rate").text(value+'%');
}



/* Update the generation display */
update_with_generation = function(data)
{
    var target=document.getElementById('animation');
    target.innerHTML="";
    
    var pop={}
    for (var i=0;i<colors.length;i++)
    {
	pop[colors[i]]=0; 
    }
    
    $.each(data, function(i,item)
	   {
	       target.innerHTML += '<img class="blob'+item.code+'" id="blob'+i+'" onclick="activate('+i+')"/>';
	       pop[item.code]++;
	   });
    
    generation_population.push({generation:current_gen, population:pop});
}
