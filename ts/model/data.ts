namespace Data
{
	export const StoragePerWarehouse = 5;

	export class BotDef
	{
		constructor(public name: string, public production: number, public price: number) { }
	}

	export const BotDefs = // Same order as Model.BotType.
	[
		new BotDef('BitBot', 2, 1),
		new BotDef('BlockBot', 3, 2),
		new BotDef('CopBot', 2, 3),
		new BotDef('CropBot', 3, 2),
		new BotDef('DocBot', 1, 6),
		new BotDef('DropBot', 2, 3),
		new BotDef('MopBot', 6, 1),
	];
}