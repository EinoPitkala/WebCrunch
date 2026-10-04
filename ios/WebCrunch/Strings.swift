import Foundation

enum Words {
    static let values: [String: [String]] = [
        "history": ["Historia", "History", "Historik"],
        "older": ["Edellinen lauseke", "Previous expression", "Föregående uttryck"],
        "newer": ["Seuraava lauseke", "Next expression", "Nästa uttryck"],
        "clear": ["Tyhjennä", "Clear", "Rensa"],
        "settings": ["Asetukset", "Settings", "Inställningar"],
        "empty": ["Ei vielä laskuja", "No calculations yet", "Inga beräkningar ännu"],
        "hint": ["Kirjoita lasku näppäimistöllä.", "Enter an expression below.", "Skriv ett uttryck nedan."],
        "expression": ["Lauseke", "Expression", "Uttryck"],
        "calculate": ["Laske", "Calculate", "Beräkna"],
        "language": ["Kieli", "Language", "Språk"],
        "angle": ["Kulmayksikkö", "Angle mode", "Vinkelenhet"],
        "radians": ["Radiaanit", "Radians", "Radianer"],
        "degrees": ["Asteet", "Degrees", "Grader"],
        "done": ["Valmis", "Done", "Klar"],
        "reuse": ["Käytä lauseketta", "Reuse expression", "Återanvänd uttryck"],
        "copy": ["Kopioi tulos", "Copy result", "Kopiera resultat"],
        "delete": ["Poista merkki", "Delete character", "Radera tecken"],
        "left": ["Kohdistin vasemmalle", "Move cursor left", "Flytta markören åt vänster"],
        "right": ["Kohdistin oikealle", "Move cursor right", "Flytta markören åt höger"],
        "clearInput": ["Tyhjennä syöte", "Clear input", "Rensa inmatning"],
        "clearTitle": ["Tyhjennetäänkö laskut?", "Clear calculations?", "Rensa beräkningar?"],
        "clearBody": ["Myös tallennetut muuttujat ja funktiot poistetaan.", "Saved variables and functions will also be removed.", "Sparade variabler och funktioner tas också bort."],
        "cancel": ["Peruuta", "Cancel", "Avbryt"],
        "engineError": ["Laskentamoottori ei vastaa. Sulje ja avaa sovellus uudelleen.", "Calculator unavailable. Close and reopen the app.", "Kalkylatorn är inte tillgänglig. Stäng och öppna appen igen."],
        "saveError": ["Istuntoa ei voitu tallentaa laitteelle.", "Could not save the session on this device.", "Kunde inte spara sessionen på enheten."],
        "restoreError": ["Tallennettua istuntoa ei voitu palauttaa.", "Could not restore the saved session.", "Kunde inte återställa den sparade sessionen."],
        "saved": ["tallennettu", "saved", "sparad"],
        "font": ["Fontti", "Font", "Typsnitt"],
        "mono": ["Tasalevyinen", "Monospace", "Fast bredd"],
        "sans": ["Pääteviivaton", "Sans serif", "Sans serif"],
        "serif": ["Pääteviivallinen", "Serif", "Serif"],
        "size": ["Tekstin koko", "Text size", "Textstorlek"],
        "privacy": ["Laskut tallentuvat vain tälle laitteelle. Verkkoyhteyttä ei tarvita.", "Calculations stay on this device. No internet connection needed.", "Beräkningar sparas bara på denna enhet. Ingen internetanslutning behövs."],
        "licenses": ["Avoimen lähdekoodin lisenssit", "Open source licenses", "Licenser för öppen källkod"],
        "numbers": ["Numerot", "Numbers", "Siffror"],
        "functions": ["Funktiot", "Functions", "Funktioner"],
        "letters": ["Kirjaimet", "Letters", "Bokstäver"],
        "space": ["Välilyönti", "Space", "Mellanslag"],
    ]
    static func text(_ key: String, _ locale: String) -> String {
        values[key]?[locale == "fi" ? 0 : locale == "sv" ? 2 : 1] ?? key
    }
}
