/**
 *  @brief Gen-O-Mix Animation engine
 *  @author "Aurelien VALADE"<wolvi.lataniere@gmail.com>
 *  @date Jan 2016
 *  @license GNU GPLv3
 */



var random_rate = 0;
var generation_population=[];
var current_gen = 0;
var generation = [];
var colors='RGBCMY';
var series_colors=["#FF0000", "#00FF00", "#0000FF","#00FFFF", "#FF00FF", "#FFFF00"];
var last_gen=200;
var anim_timer;
/**
 @brief Startup function
*/
$(function(){
/* Update graph from data */
    clear_graph = function()
    {
	p=$.jqplot('chartdiv', [[[0,0]],[[0,0]],[[0,0]]],{
	    title:'Evolution de la fréquence des allèles au cours des générations',
	    axes:{
		xaxis:{
		    label:"Génération"
		},
		yaxis:{
		    label:"Nombre d'individus"
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
	title:'Evolution de la fréquence des allèles au cours des générations',
	    seriesColors:series_colors,
	    axes:{
		xaxis:{
		    label:"Génération"
		},
		yaxis:{
		    label:"Nombre d'individus"
		}
	    }
	});

	p.replot();
    }

    clear_graph();
    
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
			   $("#play").attr('src',"/images/fast_forward.png");
			   $("#play").attr('alt', "Démarrer le mode automatique");
			   $("#animation").text("");
			   $("#generation_num").text("0");
			   clear_graph();
		       });
    
    //
    $("#play").click(function(){
	if (anim_timer.isActive)
	{
	    anim_timer.pause();
	    $("#play").attr('src',"/images/fast_forward.png");
	    $("#play").attr('alt', "Démarrer le mode automatique");
	}
	else
	{
	    last_gen = $('#batch_size').val();
	    anim_timer.play();
	    $("#play").attr('src',"/images/pause.png");
	    $("#play").attr('alt', "Mettre en pause le mode automatique");
	}
    });
    
    $("#next").click(function(){
	if (current_gen == 0)
	{
	    $.ajax({type:'GET', datatype:'JSON', url:'/first_generation', data:{
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
	    $.ajax({type:'GET', url:'/next_gen',
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
	  //  document.getElementById('blob'+i).style.filter = 'alpha(opacity=40)';
	    document.getElementById('blob'+i).style.opacity = 0.2;
	    generation[i].is_active = false;
	}
	else
	{
	    document.getElementById('blob'+i).style.opacity=1;
	    generation[i].is_active = true;
	}
    };
    
    $('#random_mut').attr('checked',false);
    $('#mutation_rate_selection').hide();
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
