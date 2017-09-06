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

		getRawPrice()
		{
			return Data.BotDefs[this.type].price + this.qualityCards;
		}

		getPrice()
		{
			let price = this.getRawPrice();

			let market = Model.state.getMarket();
			if (market && market.type == this.type)
				if (market.delta > 0 || price > 1)
					price += market.delta;

			return price;
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
			this.money += this.robots * this.getPrice();
			this.robots = 0;
		}
	}
}