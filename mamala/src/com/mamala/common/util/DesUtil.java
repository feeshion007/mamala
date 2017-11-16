package com.mamala.common.util;

/**
 * Created by OA on 2015/12/3.
 */
import org.apache.log4j.Logger;
import sun.misc.BASE64Decoder;
import sun.misc.BASE64Encoder;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import java.security.Key;
import java.security.SecureRandom;

public class DesUtil {

    private static Logger logger = Logger.getLogger(DesUtil.class);
    private static Key key;
    private static String SALT = "rbisKey";

    static{
        try{
            KeyGenerator generator = KeyGenerator.getInstance("DES");
            SecureRandom secureRandom = SecureRandom.getInstance("SHA1PRNG");
            secureRandom.setSeed(SALT.getBytes());
            generator.init(secureRandom);
            key = generator.generateKey();
            generator = null;
        }catch (Exception e){
            e.printStackTrace();
            throw new RuntimeException(e);
        }
    }

    public static String getEncryptString(String str){
        BASE64Encoder base64Encoder = new BASE64Encoder();
        try{
            byte[] strBytes = str.getBytes("UTF-8");
            Cipher cipher = Cipher.getInstance("DES");
            cipher.init(Cipher.ENCRYPT_MODE, key);
            byte[] encryptStrBytes = cipher.doFinal(strBytes);
            return base64Encoder.encode(encryptStrBytes) ;
        }catch (Exception e){
            e.printStackTrace();
            throw new RuntimeException(e);
        }
    }

    public static String getDecryptString(String str){
        BASE64Decoder base64Decoder = new BASE64Decoder();
        try{
            byte[] strBytes = base64Decoder.decodeBuffer(str);
            Cipher cipher = Cipher.getInstance("DES");
            cipher.init(Cipher.DECRYPT_MODE, key);
            byte[] encryptStrBytes = cipher.doFinal(strBytes);
            return new String(encryptStrBytes, "UTF-8");
       }catch (Exception e){
            e.printStackTrace();
            throw new RuntimeException(e);
        }
    }

    public static void main(String[] args){
        String name = "xxxx";
        String password = "jdbc:mysql://127.0.0.1:3806/rbis_update?useUnicode=true&amp;characterEncoding=UTF-8";
        String encryname = getEncryptString(name);
        String encrypassword = getEncryptString(password);
        System.out.println("username: " + encryname);
        System.out.println("password:" + encrypassword);

        System.out.println(getDecryptString(encrypassword));
    }

}
