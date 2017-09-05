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
			return Data.BotDefs[this.type].price + this.getMarketDelta() + this.qualityCards;
		}

		getMarketDelta()
		{
			let market = Model.state.getMarket();
			return market && market.type == this.type ? market.delta : 0;
		}

		getProduction()
		{
			return Data.BotDefs[this.type].production + this.productionCards;
		}

		produce()
		{
			this.robots += Math.min(this.getProduction(), this.getStorage() - this.robots);
		}

		payday()
		{
			this.money = this.robots * this.getProduction();
			this.robots = 0;
		}
	}
}