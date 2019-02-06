/**
 * if you want to prevent a whole category from being printed to log,
 * just add its name in this array
 */
const muted_categories = [];

class UtilDebug {
    log(category) {
        if(muted_categories.find(category) !== undefined)
            return;

        Array.from(arguments).slice(1).forEach(arg => {
            console.log(`[${category}] ${arg}`)
        });
    }
}

module.exports = new UtilDebug();
