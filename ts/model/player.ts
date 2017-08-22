namespace Model
{
	export class Player
	{
		type = BotType.Basic;
		warehouseCards = 0;
		qualityCards = 0;
		productionCards = 0;
		robots = 0;
		money = 0;
		sabotaged = false;
		
		constructor(public name: string)
		{
		}

		getStorage()
		{
			return Data.StoragePerWarehouse * (1 + this.warehouseCards);
		}

		getPrice()
		{
			return Data.BotDefs[this.type].price + this.qualityCards;
		}

		getProduction()
		{
			return Data.BotDefs[this.type].production + this.productionCards;
		}
	}
}