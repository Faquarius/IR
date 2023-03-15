// Calcul de l'IGR (Impôt Général sur le revenu)

// Gestion des jours IGR
var ma_igr_tr = ctx.getCompteur("$igr_jr_tr"); // Jours IGR travaillés

//---------------------------------------------------------/
// Etape 1 : Calcul de la base imposable   /
//-----------------------------------------------------------/  

var brut = ctx.getCompteur("$brut"); // Salaire brut du mois
var ma_cum_brut = ctx.getCumul("$ma_cum_brut"); // Cumul du brut
var ma_base_non_imp = ctx.getCompteur("$ma_base_non_imp"); // Base non imposable du mois
var ma_cum_ind_nimp = ctx.getCumul("$ma_cum_ind_nimp"); // Cumul base non imposable
var brutfisc = ctx.getCompteur("$brutfisc"); // Salaire brut imposable du igr_imposable
var ma_cum_brut_imp = ctx.getCumul("$ma_cum_brut_imp"); // Cumul brut imposable
ctx.setCumul("$ma_cum_igr_base", ma_cum_brut_imp);
ctx.setCumul("$ma_cum_ind_nimp", ma_cum_ind_nimp + ma_base_non_imp);
ctx.setCumul("$ma_cum_igr_jr", ctx.getCumul("$ma_cum_igr_jr") + ma_igr_tr); // Cumul Jours IGR      
var ma_cum_igr_jr = ctx.getCumul("$ma_cum_igr_jr"); // Cumul jours imposables
ctx.setCumul("$ma_cum_igr_ms", ctx.getCumul("$ma_cum_igr_ms") + 1); // Cumul mois IGR      
var ma_cum_igr_ms = ctx.getCumul("$ma_cum_igr_ms"); // Cumul mois imposables


//----------------------------------------/
// Etape N° 2 : Calcul de l'abattement    /
//----------------------------------------/
var igr_tx_abt = ctx.getConstant("$igr_tx_abt"); //*** Lecture du taux d'abattement de l'IGR
var igr_pl_abt = ctx.getConstant("$igr_pla_abt"); //*** Lecture du plafond de l'IGR
var tot_igr_abt = ma_cum_brut_imp * igr_tx_abt / 100;

var ma_cum_igr_abt = ctx.getCumul("$ma_cum_igr_abt");
//var igr_pl_abt_an = igr_pl_abt * ma_cum_igr_jr / 26;
var igr_pl_abt_an = ctx.getCumul("$ma_cum_abt_plf") + igr_pl_abt;
var mnt_abt_mois = tot_igr_abt - ma_cum_igr_abt;
if (mnt_abt_mois > igr_pl_abt && (ma_cum_igr_abt + mnt_abt_mois) > igr_pl_abt_an) mnt_abt_mois = igr_pl_abt;
ctx.setCompteur("$igr_mnt_abt", mnt_abt_mois);
ctx.setCumul("$ma_cum_igr_abt", ctx.getCumul("$ma_cum_igr_abt") + mnt_abt_mois); // Cumul abattement 
ctx.setCumul("$ma_cum_abt_plf", igr_pl_abt_an); // Cumul palfond théorique abattement      
ma_cum_igr_abt = ctx.getCumul("$ma_cum_igr_abt");

//-----------------------------------------------/
// Etape N° 3 : Recherche des intérêts des prêts /
//-----------------------------------------------/  

var igr_int_pret = ctx.getData("s2pretimmo", "interets");
ctx.setCompteur("$igr_int_pret", igr_int_pret);
var igr_int_pret = ctx.getCompteur("$igr_int_pret");
var log_eco = ctx.getData("s2pretimmo", "log_eco");
var prix = ctx.getData("s2pretimmo", "prix");
var igr_pla_log = ctx.getConstant("$igr_pla_log");
var mensualite = ctx.getData("s2pretimmo", "mensualite");
if ((log_eco == true) && (prix <= igr_pla_log)) {
    //--------Si le  logement est économique et inf à 250KDhs  
    ctx.setCompteur("$igr_int_pret", mensualite);
    var igr_int_pret = ctx.getCompteur("$igr_int_pret");
}
ctx.setCumul("$ma_cum_igr_int_pret", ctx.getCumul("$ma_cum_igr_int_pret") + igr_int_pret);

//----------------------------------------------/
// Etape N° 4 : Calcul du salaire net imposable /
//----------------------------------------------/

var tot_chg_sal = ctx.getCompteur("$tot_chg_sal"); // Total des charges salariales               

var igr_for = ctx.getCompteur("$igr_for"); // Total des charges salariales               
var ma_ind_rep = ctx.getCompteur("$ma_ind_rep"); // Indemnité de représentation
var igr_ret_sup = ctx.getCompteur("$igr_ret_sup"); // Retraite supplémentaire

var igr_rev_imp_mois = brutfisc - mnt_abt_mois - tot_chg_sal - igr_int_pret - igr_for + ma_ind_rep - igr_ret_sup; //*** Montant du revenu imposable
//var igr_rev_imp_mois = brutfisc - mnt_abt_mois - tot_chg_sal - igr_int_pret + ma_ind_rep - igr_ret_sup; //*** Montant du revenu imposable
ctx.setCompteur("$igr_rev_imp_mois", igr_rev_imp_mois); // Base imposable du mois
var igr_rev_imp_mois_ex = brutfisc - mnt_abt_mois - tot_chg_sal; //*** Montant du revenu imposable exigible

//-----------------------------------------------------------------/
// Etape N° 5 : Calcul du taux du barème et de la somme à déduire /
//-----------------------------------------------------------------/

var igr_rev_imp = 0;
var igr_rev_imp_ex = 0;


var ma_cum_igr_rev_imp = ctx.getCumul("$ma_cum_igr_rev_imp");
ma_cum_igr_rev_imp = ma_cum_igr_rev_imp + igr_rev_imp_mois;
ctx.setCumul("$ma_cum_igr_rev_imp", ma_cum_igr_rev_imp);

var ma_cum_igr_rev_imp_ex = ctx.getCumul("$ma_cum_igr_rev_imp_ex");
ma_cum_igr_rev_imp_ex = ma_cum_igr_rev_imp_ex + igr_rev_imp_mois_ex;
ctx.setCumul("$ma_cum_igr_rev_imp_ex", ma_cum_igr_rev_imp_ex);

igr_rev_imp = ma_cum_igr_rev_imp * 312 / ma_cum_igr_jr; // Revenu annuel
igr_rev_imp_ex = ma_cum_igr_rev_imp_ex * 312 / ma_cum_igr_jr; // Revenu annuel

// Retenue exigible
ctx.setCompteur("$igr_rev_imp", igr_rev_imp_ex);
var igr_taux_ex = ctx.getTable("$igrbar_taux");
ctx.setCompteur("$igr_taux_ex", igr_taux_ex);
ctx.setCompteur("$igr_taux", igr_taux_ex);
var igr_deduction_ex = ctx.getTable("$igrbar_deduction");
ctx.setCompteur("$igr_taux_ex", igr_taux_ex);
ctx.setCompteur("$igr_deduction_ex", igr_deduction_ex);

//Retenue
ctx.setCompteur("$igr_rev_imp", igr_rev_imp);
var igr_taux = ctx.getTable("$igrbar_taux");
ctx.setCompteur("$igr_taux", igr_taux);

var igr_deduction = ctx.getTable("$igrbar_deduction");
ctx.setCompteur("$igr_deduction", igr_deduction);
ctx.setCumul("$ma_cum_igr_ded_bar", igr_deduction * ma_cum_igr_jr / 312);
//--------------------------------------------------------------/
// Etape N° 6 : Calcul de la déduction pour personnes à charges /
//--------------------------------------------------------------/
var nbEnf = 0;
ctx.read("s1enfpc");
if (ctx.s1enfpc.length) {
    for (var i = 0; i < ctx.s1enfpc.length; ++i) {
        if ((ctx.s1enfpc[i].typepc2 == "$fisc")) //on compte les personnes à cgarfe fiscale
        {
            if (!ctx.s1enfpc[i].motiffinpc || ctx.s1enfpc[i].motiffinpc == "$empty") //qui n'ont pas de motif de fin de prise en charge
            nbEnf += 1;
            else if ((ctx.s1enfpc[i].dfinpc) && (debut.compareTo(getJdsDate(ctx.s1enfpc[i].dfinpc)) <= 0)) //s'ils ont un motif on prend les actifs
            nbEnf += 1;
        }
    }
}

ctx.setCompteur("$igr_per_cha", nbEnf);
var igr_mtde = 0;
var igr_nbpc = 0;
var igr_plpc = 0;
var igr_depc = 0;
var igr_nbpc = ctx.getCompteur("$igr_per_cha"); //*** Lecture du nb de personnes à charges      
var igr_depc = ctx.getConstant("$igr_ded_pc"); //*** Lecture de la déduction par personne à charge
var igr_plpc = ctx.getConstant("$igr_ded_pla"); //*** Lecture du plafond de la déduction pour personnes à charge
igr_mtde = igr_nbpc * igr_depc; //*** Montant de la déduction pour personnes à charge
if (igr_mtde > igr_plpc) //*** Si montant de la déduction est supérieur au plafond de 180,00 DHS   
igr_mtde = igr_plpc;
ctx.setCompteur("$igr_ded_pc", igr_mtde);
var ma_cum_igr_ded_pch = ctx.getCumul("$ma_cum_igr_ded_pch") + igr_mtde;
ctx.setCumul("$ma_cum_igr_ded_pch", ma_cum_igr_ded_pch);

//-----------------------------------/
// Etape N° 8 : Calcul de la retenue /
//-----------------------------------/  
var igr_retenue_an = (igr_rev_imp * igr_taux / 100) - igr_deduction; // Retenue annuelle
var igr_retenue_an_ex = (igr_rev_imp_ex * igr_taux_ex / 100) - igr_deduction_ex; // Retenue annuelle exigible


var ma_cum_igr_retenue = ctx.getCumul("$ma_cum_igr_retenue");
var ma_cum_igr_retenue_ex = ctx.getCumul("$ma_cum_igr_retenue_ex");


var igr_retenue = igr_retenue_an * ma_cum_igr_jr / 312 - ma_cum_igr_ded_pch;
var igr_retenue_ex = igr_retenue_an_ex * ma_cum_igr_jr / 312 - ma_cum_igr_ded_pch;

igr_retenue = igr_retenue - ma_cum_igr_retenue;
igr_retenue_ex = igr_retenue_ex - ma_cum_igr_retenue_ex;

ma_cum_igr_retenue = ma_cum_igr_retenue + igr_retenue;
ma_cum_igr_retenue_ex = ma_cum_igr_retenue_ex + igr_retenue_ex;

ctx.setCumul("$ma_cum_igr_retenue", ma_cum_igr_retenue);
ctx.setCumul("$ma_cum_igr_retenue_ex", ma_cum_igr_retenue_ex);

ctx.setCompteur("$igr_retenue", igr_retenue);
ctx.setCompteur("$igr_retenue_ex", igr_retenue_ex);


// Construction de l'affichage du détail du calcul
var ma_igr_det_calcul = "<html>"; // Initialisation du compteur pour l'édition du détail du calcul de l'IGR. 
ma_igr_det_calcul += "<b>Détail du calcul de l'IGR</b>";
ma_igr_det_calcul += "<br>Salaire brut du mois = " + brut.round(2) + " - Cumul salaire brut : " + ma_cum_brut.round(2);
ma_igr_det_calcul += "<br>Base non imposable du mois = " + ma_base_non_imp.round(2) + " - Cumul base non imposable : " + ma_cum_ind_nimp.round(2);
ma_igr_det_calcul += "<br>Brut imposable du mois = " + brutfisc.round(2) + " - Cumul brut imposable : " + ma_cum_brut_imp.round(2);
ma_igr_det_calcul += "<br>Jours imposables du mois = " + ma_igr_tr.round(2) + " - Cumul jours imposables : " + ma_cum_igr_jr.round(2);
ma_igr_det_calcul += "<br>Abattement du mois = " + mnt_abt_mois.round(2) + " - Cumul abattement : " + ma_cum_igr_abt.round(2);
ma_igr_det_calcul += "<br><b>- Salaire net imposable</b>";
ma_igr_det_calcul += "<br>Salaire net imposable  =  Brut imposable - Abattement - Charges salariales - Intérêts prêt - Retraite supplémentaire hors paie";
ma_igr_det_calcul += "<br>Charges salariales = " + tot_chg_sal.round(2);
ma_igr_det_calcul += "<br>Brut imposable = " + brutfisc.round(2);
ma_igr_det_calcul += "<br>Abattement = " + mnt_abt_mois.round(2);
ma_igr_det_calcul += "<br>Charges salariales = " + tot_chg_sal.round(2);
ma_igr_det_calcul += "<br>Intérêts prêt = " + igr_int_pret.round(2);

ma_igr_det_calcul += "<br>Retraite supplémentaire hors paie = " + igr_ret_sup.round(2);
ma_igr_det_calcul += "<br>Salaire net imposable = " + brutfisc.round(2) + "  -  " + mnt_abt_mois.round(2) + "  -  " + tot_chg_sal.round(2) + "  -  " + igr_int_pret.round(2) + "  -  " + igr_ret_sup.round(2) + "  =  " + igr_rev_imp_mois.round(2);
ma_igr_det_calcul += "<br><b>- Calcul de la déduction personnes à charges</b>";
ma_igr_det_calcul += "<br>Revenu imposable annuel = " + igr_rev_imp.round(2);
ma_igr_det_calcul += "<br>Taux barème = " + igr_taux.round(2);
ma_igr_det_calcul += "<br>Somme à déduire barème = " + igr_deduction.round(2);
ma_igr_det_calcul += "<br><b>- Calcul du taux du barème et de la somme à déduire.</b>";
ma_igr_det_calcul += "<br>IGR Montant annuel = " + igr_retenue_an.round(2);
ma_igr_det_calcul += "<br>IGR Montant mensuel = " + igr_retenue.round(2);
ma_igr_det_calcul += "<br>IGR Cumul = " + ma_cum_igr_retenue.round(2);

ma_igr_det_calcul += "<br><b>- Déduction pour personnes à charge</b>";
ma_igr_det_calcul += "<br>Nombre de perssones à charge (y compris le conjoint) : " + nbEnf;
ma_igr_det_calcul += "<br>Montant de décuction par personnes à charge : " + igr_depc;
ma_igr_det_calcul += "<br>Le montant de la déduction pour " + nbEnf + " est donc : " + igr_mtde;


ma_igr_det_calcul += "<br><b> - Calcul de la retenue</b>";
ma_igr_det_calcul += "<br>Retenue = " + igr_retenue.round(2);
ma_igr_det_calcul += "</html>";
ctx.setCompteur("$ma_igr_det_calcul", ma_igr_det_calcul);