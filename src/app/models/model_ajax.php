<?php

class Model_Ajax extends Model
{
    public function get_coefficients()
    {
        if (isset($_POST['word']) && $_POST['word'] !== '') {
            $word = $_POST['word'];
            $csv_raw = preg_split('/\\r\\n?|\\n/', file_get_contents('data/data.csv'));
            $csv = array();
            foreach ($csv_raw as $key => $value) {
                if ($key != 0) {
                    $new_value = $value;
                    if (substr($new_value, -1) === ';')
                        $new_value = substr($new_value, 0, -1);
                    $new_value = explode(';', preg_replace('/\"/', '', $new_value));
                    $csv[$new_value[0]] = (float) preg_replace('/,/', '.', $new_value[1]); //-2..2
                }
            }
            $min_lev_val = 1000;
            $min_lev = '';
            foreach ($csv as $key => $value) {
                $val = levenshtein($key, $word);
                if ($val < $min_lev_val) {
                    $min_lev_val = $val;
                    $min_lev = $key;
                }
            }
            $coef_color = $csv[$min_lev] + 2;
            $random1 = (mt_rand() / mt_getrandmax()) / 5 - 0.1;
            if ($coef_color + $random1 < 0 || $coef_color + $random1 > 4)
                $coef_color -= $random1;
            else
                $coef_color += $random1;
            $h = $coef_color * 90;
            $s = (mt_rand() / mt_getrandmax()) * 50 + 50;
            $v = 100;
            $rgb = $this->fGetRGB($h, $s, $v);




            $url = "https://psi-technology.net/servisfonosemantika.php";

            $post_data = array (
                "slovo" => iconv("UTF-8", "Windows-1251", $word),
                "sub" => ""
            );

            $ch = curl_init();

            curl_setopt($ch, CURLOPT_URL, $url);

            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);

            $matches1 = array();
            preg_match('/<table class="prais"[\s\S]*?<\/table>/', strip_tags(curl_exec($ch),'<table><tbody><th><tr><td><span><div>'), $matches1);

            curl_close($ch);




            $matches2 = array();
            preg_match_all('/(<tr>[\s\S]*?<\/tr>)/', $matches1[0], $matches2);


            $roughness = preg_split('/\\r\\n?|\\n/', trim($matches2[0][12]));
            if (preg_match_all('/red/', $roughness[4]))
                $roughness = $roughness[2];
            else if (preg_match_all('/blue/', $roughness[4]))
                $roughness = "-" . trim($roughness[2]);
            else {
                if (mt_rand() / mt_getrandmax() >= 0.5) {
                    $roughness = $roughness[2];
                } else {
                    $roughness = "-" . trim($roughness[2]);
                }
            }
            $roughness = (float) preg_replace('/,/', '.', trim(strip_tags($roughness)));


            $angularity = preg_split('/\\r\\n?|\\n/', trim($matches2[0][18]));
            if (preg_match_all('/red/', $angularity[4]))
                $angularity = $angularity[2];
            else if (preg_match_all('/blue/', $angularity[4]))
                $angularity = "-" . trim($angularity[2]);
            else {
                if (mt_rand() / mt_getrandmax() >= 0.5) {
                    $angularity = $angularity[2];
                } else {
                    $angularity = "-" . trim($angularity[2]);
                }
            }
            $angularity = (float) preg_replace('/,/', '.', trim(strip_tags($angularity)));

            $angularity = ($angularity + $roughness) / 2;
            if ($angularity < -4)
                $angularity = -4;
            if ($angularity > 4)
                $angularity = 4;

            $angularity = ($angularity + 4) / 8;


            $res = array("error" => false, "word" => $word, "angularity" => $angularity, "color" => $rgb, "foundWord" => $min_lev);

            return $res;
        } else
            return array("error" => true);
    }

    function fGetRGB($iH, $iS, $iV) {
        if($iH < 0)   $iH = 0;   // Hue:
        if($iH > 360) $iH = 360; //   0-360
        if($iS < 0)   $iS = 0;   // Saturation:
        if($iS > 100) $iS = 100; //   0-100
        if($iV < 0)   $iV = 0;   // Lightness:
        if($iV > 100) $iV = 100; //   0-100
        $dS = $iS/100.0; // Saturation: 0.0-1.0
        $dV = $iV/100.0; // Lightness:  0.0-1.0
        $dC = $dV*$dS;   // Chroma:     0.0-1.0
        $dH = $iH/60.0;  // H-Prime:    0.0-6.0
        $dT = $dH;       // Temp variable
        while($dT >= 2.0) $dT -= 2.0; // php modulus does not work with float
        $dX = $dC*(1-abs($dT-1));     // as used in the Wikipedia link
        switch(floor($dH)) {
            case 0:
                $dR = $dC; $dG = $dX; $dB = 0.0; break;
            case 1:
                $dR = $dX; $dG = $dC; $dB = 0.0; break;
            case 2:
                $dR = 0.0; $dG = $dC; $dB = $dX; break;
            case 3:
                $dR = 0.0; $dG = $dX; $dB = $dC; break;
            case 4:
                $dR = $dX; $dG = 0.0; $dB = $dC; break;
            case 5:
                $dR = $dC; $dG = 0.0; $dB = $dX; break;
            default:
                $dR = 0.0; $dG = 0.0; $dB = 0.0; break;
        }
        $dM  = $dV - $dC;
        $dR += $dM; $dG += $dM; $dB += $dM;
        $dR *= 255; $dG *= 255; $dB *= 255;
        return array("r" => round($dR), "g" => round($dG), "b" => round($dB));
    }
}
?>