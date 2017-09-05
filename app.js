"use strict";
var Util;
(function (Util) {
    function assert(condition, message) {
        if (!condition) {
            let str = 'Assertion failed';
            if (message)
                str += ': ' + message;
            str += '\n\nCall stack:\n' + (new Error).stack;
            alert(str);
            debugger;
        }
    }
    Util.assert = assert;
    function setPrototype(obj, type) {
        obj.__proto__ = type.prototype;
    }
    Util.setPrototype = setPrototype;
})(Util || (Util = {}));
var Controller;
(function (Controller) {
    let currentCard;
    function onLoad() {
        Model.init();
        View.init();
        View.update();
    }
    Controller.onLoad = onLoad;
    function onAddPlayer(name) {
        name.trim();
        if (name.length) {
            Model.state.addPlayer(name);
            View.update();
        }
    }
    Controller.onAddPlayer = onAddPlayer;
    function onStartGame() {
        Model.state.start();
        View.update();
    }
    Controller.onStartGame = onStartGame;
    function onReset() {
        if (confirm('Reset game?')) {
            Model.resetState();
            View.update();
        }
    }
    Controller.onReset = onReset;
    function onSelect(index) {
        currentCard.selectIndex = index;
    }
    Controller.onSelect = onSelect;
    function onRadio(index) {
        currentCard.radioIndex = index;
    }
    Controller.onRadio = onRadio;
    function onOK() {
        View.hidePage();
        currentCard.apply();
        View.update();
    }
    Controller.onOK = onOK;
    function onCancel() {
        View.hidePage();
    }
    Controller.onCancel = onCancel;
    function onCardClicked(tag) {
        currentCard = Controller.makeCard(tag);
        View.populateCard(currentCard);
    }
    Controller.onCardClicked = onCardClicked;
})(Controller || (Controller = {}));
var Data;
(function (Data) {
    Data.StoragePerWarehouse = 5;
    class BotDef {
        constructor(name, production, price) {
            this.name = name;
            this.production = production;
            this.price = price;
        }
    }
    Data.BotDef = BotDef;
    Data.BotDefs = [
        new BotDef('BitBot', 2, 1),
        new BotDef('BlockBot', 3, 2),
        new BotDef('CopBot', 2, 3),
        new BotDef('CropBot', 3, 2),
        new BotDef('DocBot', 1, 6),
        new BotDef('DropBot', 2, 3),
        new BotDef('MopBot', 6, 1),
    ];
})(Data || (Data = {}));
var Model;
(function (Model) {
    // Same order as Data.BotDefs. Basic must be first.
    var BotType;
    (function (BotType) {
        BotType[BotType["Basic"] = 0] = "Basic";
        BotType[BotType["Block"] = 1] = "Block";
        BotType[BotType["Cop"] = 2] = "Cop";
        BotType[BotType["Crop"] = 3] = "Crop";
        BotType[BotType["Doc"] = 4] = "Doc";
        BotType[BotType["Drop"] = 5] = "Drop";
        BotType[BotType["Mop"] = 6] = "Mop";
        BotType[BotType["_Count"] = 7] = "_Count";
    })(BotType = Model.BotType || (Model.BotType = {}));
    var Phase;
    (function (Phase) {
        Phase[Phase["Play"] = 0] = "Play";
        Phase[Phase["Pickup"] = 1] = "Pickup";
    })(Phase = Model.Phase || (Model.Phase = {}));
    ;
    function getBotName(type) {
        return Data.BotDefs[type].name;
    }
    Model.getBotName = getBotName;
    class Market {
        constructor(type, delta) {
            this.type = type;
            this.delta = delta;
        }
    }
    Model.Market = Market;
    class State {
        constructor() {
            this.players = [];
            this.currentPlayer = -1;
            this.phase = Phase.Play;
            this.markets = [];
        }
        onLoad() {
            for (let player of this.players)
                Util.setPrototype(player, Model.Player);
        }
        addPlayer(name) {
            this.players.push(new Model.Player(name));
            Model.saveState();
        }
        start() {
            this.currentPlayer = 0;
            Model.saveState();
        }
        hasStarted() {
            return this.currentPlayer >= 0;
        }
        advance() {
            Util.assert(this.hasStarted());
            if (this.phase == Phase.Play) {
                this.getCurrentPlayer().produce();
                this.phase = Phase.Pickup;
            }
            else {
                this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
                this.phase = Phase.Play;
            }
            Model.saveState();
        }
        getCurrentPlayer() {
            if (!this.hasStarted())
                return null;
            return this.players[this.currentPlayer];
        }
        payday() {
            for (let player of this.players)
                player.payday();
        }
        getMarket() {
            return this.markets.length ? this.markets[this.markets.length - 1] : null;
        }
        pushMarket(type, delta) {
            this.markets.push(new Model.Market(type, delta));
        }
        popMarket() {
            if (this.markets.length >= 1)
                this.markets.pop();
        }
    }
    State.key = "state.v1";
    Model.State = State;
    function init() {
        let str = localStorage.getItem(State.key);
        if (str) {
            Model.state = JSON.parse(str);
            Util.setPrototype(Model.state, State);
            Model.state.onLoad();
        }
        else
            resetState();
    }
    Model.init = init;
    function saveState() {
        localStorage.setItem(State.key, JSON.stringify(Model.state));
    }
    Model.saveState = saveState;
    function resetState() {
        Model.state = new State();
        localStorage.removeItem(State.key);
        saveState();
    }
    Model.resetState = resetState;
})(Model || (Model = {}));
var Model;
(function (Model) {
    class Player {
        constructor(name) {
            this.name = name;
            this.type = Model.BotType.Basic;
            this.warehouseCards = 0;
            this.qualityCards = 0;
            this.productionCards = 0;
            this.robots = 0;
            this.money = 0;
            this.sabotaged = false;
        }
        getStorage() {
            return Data.StoragePerWarehouse * (1 + this.warehouseCards);
        }
        getPrice() {
            return Data.BotDefs[this.type].price + this.getMarketDelta() + this.qualityCards;
        }
        getMarketDelta() {
            let market = Model.state.getMarket();
            return market && market.type == this.type ? market.delta : 0;
        }
        getProduction() {
            return Data.BotDefs[this.type].production + this.productionCards;
        }
        produce() {
            this.robots += Math.min(this.getProduction(), this.getStorage() - this.robots);
        }
        payday() {
            this.money += this.robots * this.getPrice();
            this.robots = 0;
        }
    }
    Model.Player = Player;
})(Model || (Model = {}));
var View;
(function (View) {
    var Table;
    (function (Table) {
        class Cell {
            constructor(width) {
                this.width = width;
                this.cellElement = null;
                this.cellElement = document.createElement('td');
                if (this.width)
                    this.cellElement.style.width = this.width.toString() + '%';
            }
            getElement() {
                return this.cellElement;
            }
        }
        Table.Cell = Cell;
        class TextCell extends Cell {
            constructor(content, width) {
                super(width);
                this.content = content;
            }
            getElement() {
                let e = super.getElement();
                e.innerHTML = this.content;
                return e;
            }
        }
        Table.TextCell = TextCell;
        class Factory {
            constructor(table = null) {
                this.table = table ? table : document.createElement('table');
                this.table.innerHTML = '';
            }
            addColumnHeader(name, width) {
                if (!this.headerRow) {
                    this.headerRow = this.table.insertRow(0);
                    this.headerRow.className = 'disabled';
                }
                let th = document.createElement('th');
                this.headerRow.appendChild(th);
                th.innerText = name;
                if (width)
                    th.style.width = width.toString() + '%';
            }
            addRow(cells) {
                let row = document.createElement('tr');
                row.className = 'table_row';
                this.table.appendChild(row);
                for (let cell of cells)
                    row.appendChild((cell ? cell : new Cell()).getElement());
                return row;
            }
        }
        Table.Factory = Factory;
    })(Table = View.Table || (View.Table = {}));
})(View || (View = {}));
var View;
(function (View) {
    function addTab(name, tag) {
        let tab = document.createElement('div');
        tab.innerText = name;
        tab.className = 'card';
        tab.addEventListener('click', () => {
            onCardClicked(tag, tab);
        });
        return tab;
    }
    function init() {
        let div = document.getElementById('event_cards');
        div.appendChild(addTab('Market', 'market'));
        div.appendChild(addTab('Bot Rot', 'botrot'));
        div.appendChild(addTab('Finish', 'finish'));
        div = document.getElementById('upgrade_cards');
        div.appendChild(addTab('Blueprint', 'blueprint'));
        div.appendChild(addTab('Warehouse', 'warehouse'));
        div.appendChild(addTab('Production', 'production'));
        div.appendChild(addTab('Quality', 'quality'));
        div = document.getElementById('action_cards');
        div.appendChild(addTab('Payday', 'payday'));
        div.appendChild(addTab('Market Crash', 'crash'));
        div.appendChild(addTab('Sabotage', 'sabotage'));
        div.appendChild(addTab('Espionage', 'espionage'));
        div.appendChild(addTab('Sell Blueprint', 'sell'));
        div.appendChild(addTab('Discard', 'discard'));
        document.getElementById('reset_button').addEventListener('click', Controller.onReset);
        document.getElementById('start_game_button').addEventListener('click', Controller.onStartGame);
        document.getElementById('add_player_button').addEventListener('click', View.onAddPlayer);
        document.getElementById('cancel_button').addEventListener('click', Controller.onCancel);
        document.getElementById('ok_button').addEventListener('click', Controller.onOK);
        document.getElementById('player_name_input').addEventListener('keypress', function (event) {
            if (event.keyCode == 13)
                View.onAddPlayer();
        });
    }
    View.init = init;
    function update() {
        let factory = new View.Table.Factory(document.getElementById('player_table'));
        factory.addColumnHeader('Name');
        if (Model.state.hasStarted()) {
            factory.addColumnHeader('Blueprint');
            factory.addColumnHeader('Price');
            factory.addColumnHeader('Production');
            factory.addColumnHeader('Storage');
            factory.addColumnHeader('Robots');
            factory.addColumnHeader('Money');
        }
        let index = 0;
        for (let player of Model.state.players) {
            let cells = [];
            cells.push(new View.Table.TextCell(player.name));
            if (Model.state.hasStarted()) {
                let productionCell = new View.Table.TextCell(player.getProduction().toString());
                let priceCell = new View.Table.TextCell(player.getPrice().toString());
                if (player.sabotaged)
                    productionCell.cellElement.classList.add('sabotaged');
                let marketDelta = player.getMarketDelta();
                if (marketDelta)
                    priceCell.cellElement.classList.add(marketDelta < 0 ? 'minus' : 'plus');
                cells.push(new View.Table.TextCell(Model.getBotName(player.type)));
                cells.push(priceCell);
                cells.push(productionCell);
                cells.push(new View.Table.TextCell(player.getStorage().toString()));
                cells.push(new View.Table.TextCell(player.robots.toString()));
                cells.push(new View.Table.TextCell(player.money.toString()));
            }
            let row = factory.addRow(cells);
            if (index++ == Model.state.currentPlayer)
                row.classList.add('tr_selected');
        }
        let started = Model.state.hasStarted();
        document.getElementById('lobby_div').hidden = started;
        document.getElementById('play_div').hidden = !(started && Model.state.phase == Model.Phase.Play);
        document.getElementById('pickup_div').hidden = !(started && Model.state.phase == Model.Phase.Pickup);
        document.getElementById('start_game_button').disabled = Model.state.players.length == 0;
        let market = Model.state.getMarket();
        let marketString = '';
        if (market) {
            marketString = 'Market: ' + Data.BotDefs[market.type].name + 's ';
            if (market.delta > 0)
                marketString += '+';
            marketString += market.delta;
        }
        document.getElementById('market_span').innerText = marketString;
    }
    View.update = update;
    function onAddPlayer() {
        let input = document.getElementById('player_name_input');
        Controller.onAddPlayer(input.value);
        input.value = '';
        input.focus();
    }
    View.onAddPlayer = onAddPlayer;
    function onCardClicked(tag, tab) {
        let page = document.getElementById('page');
        page.style.left = tab.offsetLeft.toString() + 'px';
        page.style.top = tab.offsetTop.toString() + 'px';
        page.style.width = tab.offsetWidth.toString() + 'px';
        page.style.height = tab.offsetHeight.toString() + 'px';
        document.body.offsetWidth; // Force layout.
        page.style.left = page.style.top = page.style.width = page.style.height = '';
        page.classList.add('show');
        Controller.onCardClicked(tag);
    }
    function populateCard(cardVM) {
        let contentDiv = document.getElementById('page_content');
        contentDiv.innerHTML = '';
        let title = document.getElementById('page_title');
        title.innerText = cardVM.name;
        let card = new View.Card(contentDiv);
        let selectList = cardVM.makeSelectList();
        let radioList = cardVM.makeRadioList();
        if (selectList) {
            card.addLabel(selectList.title);
            let select = card.addSelect();
            for (let item of selectList.items)
                card.addOption(select, item);
        }
        if (radioList) {
            card.addLabel(radioList.title);
            for (let item of radioList.items)
                card.addRadio(item);
        }
    }
    View.populateCard = populateCard;
    function hidePage() {
        document.getElementById('page').classList.remove('show');
    }
    View.hidePage = hidePage;
})(View || (View = {}));
var View;
(function (View) {
    class Card {
        constructor(contentDiv) {
            this.contentDiv = contentDiv;
            this.radioCount = 0;
        }
        addBreak() {
            this.contentDiv.appendChild(document.createElement('br'));
        }
        addLabel(label) {
            let span = document.createElement('h3');
            span.innerText = label;
            this.contentDiv.appendChild(span);
        }
        addSelect() {
            let select = document.createElement('select');
            select.id = 'select';
            select.style.overflow = 'hidden';
            select.addEventListener('change', () => { Controller.onSelect(select.selectedIndex); });
            this.contentDiv.appendChild(select);
            this.addBreak();
            return select;
        }
        addOption(select, label) {
            let option = document.createElement('option');
            option.text = label;
            let index = select.childElementCount;
            select.add(option);
            select.disabled = ++select.size <= 1;
            if (index == 0)
                select.selectedIndex = 0;
            return option;
        }
        addRadio(label) {
            if (!this.radioDiv) {
                this.radioDiv = document.createElement('div');
                this.radioDiv.id = 'page_radio_div';
                this.contentDiv.appendChild(this.radioDiv);
            }
            let index = this.radioCount++;
            let radio = document.createElement('input');
            radio.type = "radio";
            radio.name = "radio";
            radio.value = label;
            radio.addEventListener('click', () => { Controller.onRadio(index); });
            this.radioDiv.appendChild(radio);
            if (index == 0)
                radio.checked = true;
            let span = document.createElement('span');
            span.innerText = label;
            this.radioDiv.appendChild(span);
            this.radioDiv.appendChild(document.createElement('br'));
            return radio;
        }
    }
    View.Card = Card;
})(View || (View = {}));
var Controller;
(function (Controller) {
    function makeCard(tag) {
        if (tag == 'blueprint')
            return new BlueprintCard();
        if (tag == 'sell')
            return new SellCard();
        if (tag == 'sabotage')
            return new SabotageCard();
        if (tag == 'warehouse')
            return new WarehouseCard();
        if (tag == 'production')
            return new ProductionCard();
        if (tag == 'quality')
            return new QualityCard();
        if (tag == 'payday')
            return new PaydayCard();
        if (tag == 'espionage')
            return new EspionageCard();
        if (tag == 'discard')
            return new DiscardCard();
        if (tag == 'market')
            return new MarketCard();
        if (tag == 'crash')
            return new MarketCrashCard();
        if (tag == 'botrot')
            return new BotRotCard();
        if (tag == 'finish')
            return new FinishCard();
        Util.assert(false);
        return null;
    }
    Controller.makeCard = makeCard;
    class List {
        constructor(title) {
            this.title = title;
            this.items = [];
        }
    }
    class Card {
        constructor() {
            this.selectIndex = 0;
            this.radioIndex = 0;
        }
        makeSelectList() { return null; }
        makeRadioList() { return null; }
        apply() { }
    }
    Controller.Card = Card;
    class BlueprintCard extends Card {
        constructor() {
            super(...arguments);
            this.name = 'Blueprint';
        }
        makeSelectList() {
            let list = new List('Bot Type');
            let player = Model.state.getCurrentPlayer();
            if (player.type == Model.BotType.Basic)
                for (let i = 1; i < Model.BotType._Count; ++i)
                    list.items.push(Data.BotDefs[i].name);
            else
                list.items.push(Data.BotDefs[player.type].name);
            return list;
        }
        apply() {
            let player = Model.state.getCurrentPlayer();
            if (player.type == Model.BotType.Basic) {
                player.type = this.selectIndex + 1;
            }
            else {
                ++player.productionCards;
                ++player.qualityCards;
            }
            Model.state.advance();
        }
    }
    Controller.BlueprintCard = BlueprintCard;
    class SellCard extends Card {
        constructor() {
            super(...arguments);
            this.name = 'Sell';
        }
        apply() {
            Model.state.getCurrentPlayer().money += 6;
            Model.state.advance();
        }
    }
    Controller.SellCard = SellCard;
    class SabotageCard extends Card {
        constructor() {
            super(...arguments);
            this.name = 'Sabotage';
        }
        makeSelectList() {
            let list = new List('Player');
            for (let i = 0; i < Model.state.players.length; ++i)
                if (i != Model.state.currentPlayer)
                    list.items.push(Model.state.players[i].name);
            return list;
        }
        apply() {
            let index = this.selectIndex;
            if (index >= Model.state.currentPlayer)
                ++index;
            Model.state.players[index].sabotaged = true;
            Model.state.advance();
        }
    }
    Controller.SabotageCard = SabotageCard;
    class PaydayCard extends Card {
        constructor() {
            super(...arguments);
            this.name = 'Payday';
        }
        apply() {
            Model.state.payday();
            Model.state.advance();
        }
    }
    Controller.PaydayCard = PaydayCard;
    class MarketCrashCard extends Card {
        constructor() {
            super(...arguments);
            this.name = 'Market Crash';
        }
        apply() {
            Model.state.popMarket();
            Model.state.advance();
        }
    }
    Controller.MarketCrashCard = MarketCrashCard;
    class EspionageCard extends Card {
        constructor() {
            super(...arguments);
            this.name = 'Espionage';
        }
        apply() {
            Model.state.advance();
        }
    }
    Controller.EspionageCard = EspionageCard;
    class DiscardCard extends Card {
        constructor() {
            super(...arguments);
            this.name = 'Discard';
        }
        apply() {
            Model.state.advance();
        }
    }
    Controller.DiscardCard = DiscardCard;
    class QualityCard extends Card {
        constructor() {
            super(...arguments);
            this.name = 'Quality';
        }
        apply() {
            ++Model.state.getCurrentPlayer().qualityCards;
            Model.state.advance();
        }
    }
    Controller.QualityCard = QualityCard;
    class ProductionCard extends Card {
        constructor() {
            super(...arguments);
            this.name = 'Production';
        }
        apply() {
            ++Model.state.getCurrentPlayer().productionCards;
            Model.state.advance();
        }
    }
    Controller.ProductionCard = ProductionCard;
    class WarehouseCard extends Card {
        constructor() {
            super(...arguments);
            this.name = 'Warehouse';
        }
        apply() {
            ++Model.state.getCurrentPlayer().warehouseCards;
            Model.state.advance();
        }
    }
    Controller.WarehouseCard = WarehouseCard;
    class MarketCard extends Card {
        constructor() {
            super(...arguments);
            this.name = 'Market';
        }
        makeSelectList() {
            let list = new List('Bot Type');
            for (let i = 1; i < Model.BotType._Count; ++i)
                list.items.push(Data.BotDefs[i].name);
            return list;
        }
        makeRadioList() {
            let list = new List('Value');
            list.items = ['-1', '+1', '+2'];
            return list;
        }
        apply() {
            let player = Model.state.getCurrentPlayer();
            let type = (this.selectIndex + 1);
            let value = [-1, 1, 2][this.radioIndex];
            Model.state.pushMarket(type, value);
        }
    }
    Controller.MarketCard = MarketCard;
    class BotRotCard extends Card {
        constructor() {
            super(...arguments);
            this.name = 'Bot Rot';
        }
        makeRadioList() {
            let list = new List('Severity');
            list.items = ['Mild', 'Severe'];
            return list;
        }
        apply() {
            let player = Model.state.getCurrentPlayer();
            if (this.radioIndex)
                player.robots = 0;
            else
                player.robots = Math.floor(player.robots / 2);
        }
    }
    Controller.BotRotCard = BotRotCard;
    class FinishCard extends Card {
        constructor() {
            super(...arguments);
            this.name = 'Finish';
        }
        apply() {
            Model.state.getCurrentPlayer().sabotaged = false;
            Model.state.advance();
        }
    }
    Controller.FinishCard = FinishCard;
})(Controller || (Controller = {}));
