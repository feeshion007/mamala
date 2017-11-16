package com.mamala.market.dao.support;

import org.xml.sax.EntityResolver;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

import java.io.ByteArrayInputStream;
import java.io.IOException;

/**
 * Created by OA on 2015/6/2.
 */
public class IgnoreDTDEntityResolver implements EntityResolver {
    @Override
    public InputSource resolveEntity(String publicId, String systemId)
            throws SAXException, IOException {
        return new InputSource(new ByteArrayInputStream("<?xml version='1.0' encoding='UTF-8'?>".getBytes()));
    }
}
/*
public class com.ruijie.rbis.dao.support.IgnoreDTDEntityResolver implements EntityResolver {
    @Override
    public InputSource resolveEntity(String publicId, String systemId)
            throws SAXException, IOException {
        return new InputSource(new ByteArrayInputStream("<?xml version='1.0' encoding='UTF-8'?>".getBytes()));
    }
}
*/

