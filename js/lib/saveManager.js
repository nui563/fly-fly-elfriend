class SaveManager {
    data = new Object;
    storage = window.localStorage;

    constructor() {
        this.isEnabled = this.checkStorage();
        this.load();
    }

    checkStorage = () => {
        try {
            const x = '__storage_test__';
            this.storage.setItem(x, x);
            this.storage.removeItem(x);
            return true;
        }
        catch {
            return false;
        }
    }

    load = () => {
        if (!this.isEnabled) return;
        const saveList = [];
        // Object.keys(ARCADE).forEach(unit => saveList.push(`holoboom_arcade_${unit}_unlocked`));
        // Object.keys(ARCADE).forEach(unit => saveList.push(`holoboom_arcade_${unit}_cleared`));
        // Object.keys(ARCADE).forEach(unit => saveList.push(`holoboom_survival_${unit}_score`));
        saveList.push('best');
        saveList.forEach(id => this.data[id] = this.storage.getItem(id));
        if (this.data.best === null) this.save('best', 0);
        console.log('load data', this.data)
    }

    save = (key, value) => {
        if (!this.isEnabled) return;
        this.storage.setItem(key, value);
        this.data[key] = value;
    }

    clear = () => {
        this.storage.clear();
        this.load();
    }
}