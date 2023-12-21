const whitelist = ["Papa Lemmon","Sheila Gaglio", "Mrs K", "Shige Morita"];

// set the last return of export defualt ot be the full firts name with the alst initial
export default [
                    [...whitelist], 
                    [...whitelist.map(
                        (name) => 
                            (name.split(' ')[0] + ' ' + name.split(' ')[1].charAt(0)).toLowerCase()
                        )
                    ]
                ]