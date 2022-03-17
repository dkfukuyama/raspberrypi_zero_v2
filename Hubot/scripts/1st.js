// Description:
//   HelloWorld

require('');
module.exports = function(robot) {
	robot.hear("(\\S*?)@(.*?)@(.*?)($|@)", msg => {
		try{
			let m = [];
			for(let i=1; i<=3; i++){
				m.push(msg.match[i].replace("[at]", "@").replace("[l]", "[").replace("[r]", "]"));
			}
		}catch(err){
			console.log(err);
		}
	});
};
