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
    function applyClass(element, cssClass, state) {
        if (state)
            element.classList.add(cssClass);
        else
            element.classList.remove(cssClass);
    }
    Util.applyClass = applyClass;
})(Util || (Util = {}));
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
        getRawPrice() {
            return Data.BotDefs[this.type].price + this.qualityCards;
        }
        getPrice() {
            let price = this.getRawPrice();
            let market = Model.state.getMarket();
            if (market && market.type == this.type)
                if (market.delta > 0 || price > 1)
                    price += market.delta;
            return price;
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
var Presenter;
(function (Presenter) {
    var CardID;
    (function (CardID) {
        CardID[CardID["Blueprint"] = 0] = "Blueprint";
        CardID[CardID["Sell"] = 1] = "Sell";
        CardID[CardID["Sabotage"] = 2] = "Sabotage";
        CardID[CardID["Warehouse"] = 3] = "Warehouse";
        CardID[CardID["Production"] = 4] = "Production";
        CardID[CardID["Quality"] = 5] = "Quality";
        CardID[CardID["Payday"] = 6] = "Payday";
        CardID[CardID["Espionage"] = 7] = "Espionage";
        CardID[CardID["Discard"] = 8] = "Discard";
        CardID[CardID["Market"] = 9] = "Market";
        CardID[CardID["Crash"] = 10] = "Crash";
        CardID[CardID["Botrot"] = 11] = "Botrot";
        CardID[CardID["Finish"] = 12] = "Finish";
    })(CardID = Presenter.CardID || (Presenter.CardID = {}));
    ;
    function makeCard(id) {
        switch (id) {
            case CardID.Blueprint: return new BlueprintCard();
            case CardID.Sell: return new SellCard();
            case CardID.Sabotage: return new SabotageCard();
            case CardID.Warehouse: return new WarehouseCard();
            case CardID.Production: return new ProductionCard();
            case CardID.Quality: return new QualityCard();
            case CardID.Payday: return new PaydayCard();
            case CardID.Espionage: return new EspionageCard();
            case CardID.Discard: return new DiscardCard();
            case CardID.Market: return new MarketCard();
            case CardID.Crash: return new MarketCrashCard();
            case CardID.Botrot: return new BotRotCard();
            case CardID.Finish: return new FinishCard();
        }
        Util.assert(false);
        return null;
    }
    Presenter.makeCard = makeCard;
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
    Presenter.Card = Card;
    class BlueprintCard extends Card {
        constructor() {
            super(...arguments);
            this.name = 'Blueprint';
            this.id = CardID.Blueprint;
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
                player.payday();
                player.type = this.selectIndex + 1;
            }
            else {
                ++player.productionCards;
                ++player.qualityCards;
            }
            Model.state.advance();
        }
    }
    Presenter.BlueprintCard = BlueprintCard;
    class SellCard extends Card {
        constructor() {
            super(...arguments);
            this.name = 'Sell';
            this.id = CardID.Sell;
        }
        apply() {
            Model.state.getCurrentPlayer().money += 6;
            Model.state.advance();
        }
    }
    Presenter.SellCard = SellCard;
    class SabotageCard extends Card {
        constructor() {
            super(...arguments);
            this.name = 'Sabotage';
            this.id = CardID.Sabotage;
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
    Presenter.SabotageCard = SabotageCard;
    class PaydayCard extends Card {
        constructor() {
            super(...arguments);
            this.name = 'Payday';
            this.id = CardID.Payday;
        }
        apply() {
            Model.state.payday();
            Model.state.advance();
        }
    }
    Presenter.PaydayCard = PaydayCard;
    class MarketCrashCard extends Card {
        constructor() {
            super(...arguments);
            this.name = 'Market Crash';
            this.id = CardID.Crash;
        }
        apply() {
            Model.state.popMarket();
            Model.state.advance();
        }
    }
    Presenter.MarketCrashCard = MarketCrashCard;
    class EspionageCard extends Card {
        constructor() {
            super(...arguments);
            this.name = 'Espionage';
            this.id = CardID.Espionage;
        }
        apply() {
            Model.state.advance();
        }
    }
    Presenter.EspionageCard = EspionageCard;
    class DiscardCard extends Card {
        constructor() {
            super(...arguments);
            this.name = 'Discard';
            this.id = CardID.Discard;
        }
        apply() {
            Model.state.advance();
        }
    }
    Presenter.DiscardCard = DiscardCard;
    class QualityCard extends Card {
        constructor() {
            super(...arguments);
            this.name = 'Quality';
            this.id = CardID.Quality;
        }
        apply() {
            ++Model.state.getCurrentPlayer().qualityCards;
            Model.state.advance();
        }
    }
    Presenter.QualityCard = QualityCard;
    class ProductionCard extends Card {
        constructor() {
            super(...arguments);
            this.name = 'Production';
            this.id = CardID.Production;
        }
        apply() {
            ++Model.state.getCurrentPlayer().productionCards;
            Model.state.advance();
        }
    }
    Presenter.ProductionCard = ProductionCard;
    class WarehouseCard extends Card {
        constructor() {
            super(...arguments);
            this.name = 'Warehouse';
            this.id = CardID.Warehouse;
        }
        apply() {
            ++Model.state.getCurrentPlayer().warehouseCards;
            Model.state.advance();
        }
    }
    Presenter.WarehouseCard = WarehouseCard;
    class MarketCard extends Card {
        constructor() {
            super(...arguments);
            this.name = 'Market';
            this.id = CardID.Market;
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
    Presenter.MarketCard = MarketCard;
    class BotRotCard extends Card {
        constructor() {
            super(...arguments);
            this.name = 'Bot Rot';
            this.id = CardID.Botrot;
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
    Presenter.BotRotCard = BotRotCard;
    class FinishCard extends Card {
        constructor() {
            super(...arguments);
            this.name = 'Finish';
            this.id = CardID.Finish;
        }
        apply() {
            Model.state.getCurrentPlayer().sabotaged = false;
            Model.state.advance();
        }
    }
    Presenter.FinishCard = FinishCard;
})(Presenter || (Presenter = {}));
var Presenter;
(function (Presenter) {
    let currentCard;
    class CardDef {
        constructor(name, id) {
            this.name = name;
            this.id = id;
        }
    }
    Presenter.CardDef = CardDef;
    Presenter.EventCardDefs = [
        new CardDef('Market', Presenter.CardID.Market),
        new CardDef('Bot Rot', Presenter.CardID.Botrot),
        new CardDef('Finish', Presenter.CardID.Finish),
    ];
    Presenter.UpgradeCardDefs = [
        new CardDef('Blueprint', Presenter.CardID.Blueprint),
        new CardDef('Warehouse', Presenter.CardID.Warehouse),
        new CardDef('Production', Presenter.CardID.Production),
        new CardDef('Quality', Presenter.CardID.Quality),
    ];
    Presenter.ActionCardDefs = [
        new CardDef('Payday', Presenter.CardID.Payday),
        new CardDef('Market Crash', Presenter.CardID.Crash),
        new CardDef('Sabotage', Presenter.CardID.Sabotage),
        new CardDef('Espionage', Presenter.CardID.Espionage),
        new CardDef('Sell Blueprint', Presenter.CardID.Sell),
        new CardDef('Discard', Presenter.CardID.Discard)
    ];
    function onLoad() {
        Model.init();
        View.init();
        updateView();
        View.onCardChanged(null);
    }
    Presenter.onLoad = onLoad;
    function onAddPlayer(name) {
        name.trim();
        if (name.length) {
            Model.state.addPlayer(name);
            updateView();
        }
    }
    Presenter.onAddPlayer = onAddPlayer;
    function onStartGame() {
        Model.state.start();
        updateView();
    }
    Presenter.onStartGame = onStartGame;
    function onReset() {
        if (confirm('Reset game?')) {
            Model.resetState();
            updateView();
        }
    }
    Presenter.onReset = onReset;
    function onSelect(index) {
        currentCard.selectIndex = index;
    }
    Presenter.onSelect = onSelect;
    function onRadio(index) {
        currentCard.radioIndex = index;
    }
    Presenter.onRadio = onRadio;
    function onOK() {
        currentCard.apply();
        currentCard = null;
        View.onCardChanged(null);
        updateView();
    }
    Presenter.onOK = onOK;
    function onCardClicked(id) {
        currentCard = Presenter.makeCard(id);
        View.onCardChanged(currentCard);
    }
    Presenter.onCardClicked = onCardClicked;
    function updateView() {
        Presenter.state = new Presenter.State();
        View.update();
    }
})(Presenter || (Presenter = {}));
var Presenter;
(function (Presenter) {
    class Cell {
        constructor(text, style) {
            this.text = text;
            this.style = style;
        }
    }
    Presenter.Cell = Cell;
    class Player {
        constructor() {
            this.name = '';
            this.production = '';
            this.price = '';
            this.priceStyle = '';
            this.type = '';
            this.storage = '';
            this.robots = '';
            this.money = '';
            this.sabotaged = false;
            this.selected = false;
        }
    }
    Presenter.Player = Player;
    class State {
        constructor() {
            this.players = [];
            this.market = '';
            this.showLobby = false;
            this.showPlay = false;
            this.showPickup = false;
            this.canStart = false;
            this.players.length = 0;
            let started = Model.state.hasStarted();
            for (let player of Model.state.players) {
                let player2 = new Player;
                player2.name = player.name;
                if (started) {
                    let price = player.getPrice();
                    let rawPrice = player.getRawPrice();
                    player2.price = price.toString();
                    if (price != rawPrice)
                        player2.priceStyle = price < rawPrice ? 'minus' : 'plus';
                    player2.production = player.getProduction().toString();
                    player2.type = Model.getBotName(player.type);
                    player2.storage = player.getStorage().toString();
                    player2.robots = player.robots.toString();
                    player2.money = player.money.toString();
                    player2.sabotaged = player.sabotaged;
                    if (this.players.length == Model.state.currentPlayer)
                        player2.selected = true;
                }
                this.players.push(player2);
            }
            this.showLobby = !started;
            this.showPlay = started && Model.state.phase == Model.Phase.Play;
            this.showPickup = started && Model.state.phase == Model.Phase.Pickup;
            this.canStart = Model.state.players.length > 0;
            let market = Model.state.getMarket();
            if (market) {
                this.market = 'Market: ' + Data.BotDefs[market.type].name + 's ';
                if (market.delta > 0)
                    this.market += '+';
                this.market += market.delta;
            }
        }
    }
    Presenter.State = State;
})(Presenter || (Presenter = {}));
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
            select.addEventListener('change', () => { Presenter.onSelect(select.selectedIndex); });
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
            radio.addEventListener('click', () => { Presenter.onRadio(index); });
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
    class CardTab {
        constructor(id, div) {
            this.id = id;
            this.div = div;
        }
    }
    View.CardTab = CardTab;
    let _cardTabs = [];
    function addTab(name, id) {
        let tab = document.createElement('div');
        tab.innerHTML = name.replace(' ', '<br>');
        tab.className = 'card';
        tab.addEventListener('click', () => { Presenter.onCardClicked(id); });
        _cardTabs.push(new CardTab(id, tab));
        return tab;
    }
    function init() {
        let CardID = Presenter.CardID;
        let div = document.getElementById('event_cards');
        for (let card of Presenter.EventCardDefs)
            div.appendChild(addTab(card.name, card.id));
        div = document.getElementById('upgrade_cards');
        for (let card of Presenter.UpgradeCardDefs)
            div.appendChild(addTab(card.name, card.id));
        div = document.getElementById('action_cards');
        for (let card of Presenter.ActionCardDefs)
            div.appendChild(addTab(card.name, card.id));
        document.getElementById('reset_button').addEventListener('click', Presenter.onReset);
        document.getElementById('start_game_button').addEventListener('click', Presenter.onStartGame);
        document.getElementById('add_player_button').addEventListener('click', View.onAddPlayer);
        document.getElementById('ok_button').addEventListener('click', Presenter.onOK);
        document.getElementById('player_name_input').addEventListener('keypress', function (event) {
            if (event.keyCode == 13)
                View.onAddPlayer();
        });
    }
    View.init = init;
    function update() {
        let factory = new View.Table.Factory(document.getElementById('player_table'));
        const state = Presenter.state;
        factory.addColumnHeader('Name');
        if (!state.showLobby) {
            factory.addColumnHeader('Blueprint');
            factory.addColumnHeader('Price');
            factory.addColumnHeader('Production');
            factory.addColumnHeader('Storage');
            factory.addColumnHeader('Robots');
            factory.addColumnHeader('Money');
        }
        for (let player of state.players) {
            let cells = [];
            cells.push(new View.Table.TextCell(player.name));
            if (!state.showLobby) {
                let productionCell = new View.Table.TextCell(player.production);
                if (player.sabotaged)
                    productionCell.cellElement.classList.add('sabotaged');
                let priceCell = new View.Table.TextCell(player.price);
                if (player.priceStyle)
                    priceCell.cellElement.classList.add(player.priceStyle);
                cells.push(new View.Table.TextCell(player.type));
                cells.push(priceCell);
                cells.push(productionCell);
                cells.push(new View.Table.TextCell(player.storage));
                cells.push(new View.Table.TextCell(player.robots));
                cells.push(new View.Table.TextCell(player.money));
            }
            let row = factory.addRow(cells);
            if (player.selected)
                row.classList.add('tr_selected');
        }
        document.getElementById('lobby_div').hidden = !state.showLobby;
        document.getElementById('play_div').hidden = !state.showPlay;
        document.getElementById('pickup_div').hidden = !state.showPickup;
        document.getElementById('start_game_button').disabled = !state.canStart;
        document.getElementById('market_span').innerText = state.market;
        onCardChanged(null);
    }
    View.update = update;
    function onAddPlayer() {
        let input = document.getElementById('player_name_input');
        Presenter.onAddPlayer(input.value);
        input.value = '';
        input.focus();
    }
    View.onAddPlayer = onAddPlayer;
    function onCardChanged(card) {
        for (let cardTab of _cardTabs) {
            let select = card && card.id == cardTab.id;
            Util.applyClass(cardTab.div, 'card_selected', select);
            Util.applyClass(cardTab.div, 'card_unselected', !select);
        }
        let contentDiv = document.getElementById('page_content');
        contentDiv.innerHTML = '';
        document.getElementById('page').hidden = !card;
        if (!card)
            return;
        let title = document.getElementById('page_title');
        title.innerText = card.name;
        let cardUI = new View.Card(contentDiv);
        let selectList = card.makeSelectList();
        let radioList = card.makeRadioList();
        if (selectList) {
            cardUI.addLabel(selectList.title);
            let select = cardUI.addSelect();
            for (let item of selectList.items)
                cardUI.addOption(select, item);
        }
        if (radioList) {
            cardUI.addLabel(radioList.title);
            for (let item of radioList.items)
                cardUI.addRadio(item);
        }
    }
    View.onCardChanged = onCardChanged;
})(View || (View = {}));
