// Genomic module
// This module is designed to animate basic genomic simulation
//

function Specimen(generation, father, mother)
{
    if (typeof generation == 'undefined')
    {
	this.generation = 0;
    }
    else
    {
	this.generation = generation;
    }

   
    if (typeof mother == "undefined")
    {
	if (typeof father == "undefined")
	{
	    this.code = 'undefined';
	}
	else
	{
	    if (typeof father == "Specimen")
	    {
		this.code = father.code;
	    }
	    else
	    {
		this.code = father;
	    }
	}
    }
    else
    {
	this.code=this.mixing_rule(father.code, mother.code);
    }

    this.is_active=true;
};


Specimen.prototype.mixing_rule = function(father_code, mother_code)
{
    who = Math.random();
    
    if (who>=0.5)
    {
	return father_code;
    }
    else
    {
	return mother_code;
    }
};

Specimen.prototype.print = function()
{
    console.log('Genomic generation '+this.generation+', code '+this.code+'\n');
};
    
module.exports=Specimen;
