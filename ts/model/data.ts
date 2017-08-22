namespace Data
{
	export const StoragePerWarehouse = 5;
	export class BotDef
	{
		constructor(public production: number, public price: number) { }
	}

	export const BotDefs: { [key: string]: BotDef } = 
	{
		'Basic':	new BotDef(2, 1),
		'Block':	new BotDef(3, 2),
		'Cop':		new BotDef(2, 3),
		'Crop':		new BotDef(3, 2), 
		'Doc':		new BotDef(1, 6),
		'Drop':		new BotDef(2, 3), 
		'Mop':		new BotDef(6, 1),
	}
}