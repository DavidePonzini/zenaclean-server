/**
 * if you want to prevent a whole category from being printed to log,
 * just add its name in this array
 */
const muted_categories = ['LOGIN', 'ADD REPORT'];

class UtilDebug {
    log(category) {
        if(this._is_category_muted(category))
            return;

        Array.from(arguments).slice(1).forEach(arg => {
            console.log(`[${category}]`, arg);
        });
    }

    error(category) {
        if(this._is_category_muted(category))
            return;

        Array.from(arguments).slice(1).forEach(arg => {
            console.error(`[${category}]`, arg);
        });
    }

    _is_category_muted(category) {
        return muted_categories.find(cat => cat === category) !== undefined;
    }
}

module.exports = new UtilDebug();
