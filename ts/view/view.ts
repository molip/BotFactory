namespace View 
{
	export function init()
	{
	}

	export function update()
	{
		let factory = new Table.Factory(document.getElementById('player_table') as HTMLTableElement);

		factory.addColumnHeader('Name');
		if (Model.state.started)
		{
			factory.addColumnHeader('Blueprint');
			factory.addColumnHeader('Price');
			factory.addColumnHeader('Production');
			factory.addColumnHeader('Storage');
			factory.addColumnHeader('Robots');
			factory.addColumnHeader('Money');
			factory.addColumnHeader('Sabotaged');
		}

		for (let player of Model.state.players)
		{
			let cells: Table.Cell[] = [];
			cells.push(new Table.TextCell(player.name));

			if (Model.state.started)
			{
				cells.push(new Table.TextCell(Model.getBotName(player.type)));
				cells.push(new Table.TextCell(player.getPrice().toString()));
				cells.push(new Table.TextCell(player.getProduction().toString()));
				cells.push(new Table.TextCell(player.getStorage().toString()));
				cells.push(new Table.TextCell(player.robots.toString()));
				cells.push(new Table.TextCell(player.money.toString()));
				cells.push(new Table.TextCell(player.sabotaged.toString()));
			}

			factory.addRow(cells);
		}

		document.getElementById('lobby_div').hidden = Model.state.started;
		(document.getElementById('start_game_button') as HTMLButtonElement).disabled = Model.state.players.length == 0;
	}

	export function onAddPlayer()
	{
		let input = document.getElementById('player_name_input') as HTMLInputElement;
		Controller.onAddPlayer(input.value);
		input.value = '';
		input.focus();
	}
}
