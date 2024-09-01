#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
KA (Konu Anlatım) tipindeki content klasörü dizininde çalışması gerekmektedir.
KA_Publishator  versiyon atayarak publish almasını sağlar.
"""
import argparse
import os
import shutil
import re
import time
import urllib.request
import json
import fnmatch
import platform
import logging
import subprocess

version = '2.37.2'
publisherIcon = """
_____________________________________________________________________________________________________________________
                                  _____       _     _ _     _
                                 |  __ \     | |   | (_)   | |
                                 | |__) |   _| |__ | |_ ___| |__   ___ _ __
                                 |  ___/ | | | '_ \| | / __| '_ \ / _ \ '__|
                                 | |   | |_| | |_) | | \__ \ | | |  __/ |
                                 |_|    \__,_|_.__/|_|_|___/_| |_|\___|_|
______________________________________________________________________________________________________________"""


class Colors:
    if platform.system() != 'Windows':
        HEADER = '\033[95m'
        OKBLUE = '\033[94m'
        OKGREEN = '\033[92m'
        WARNING = '\033[93m'
        FAIL = '\033[91m'
        ENDC = '\033[0m'
        BOLD = '\033[1m'
        UNDERLINE = '\033[4m'
    else:
        HEADER = ''
        OKBLUE = ''
        OKGREEN = ''
        WARNING = ''
        FAIL = ''
        ENDC = ''
        BOLD = ''
        UNDERLINE = ''


"""
########################################################################################################################
#
#                                                   PUBLISHER                        
#                                   Bu Class Publisher ile ilgili genel metodları içerir
########################################################################################################################
"""


class Publisher():

    def __init__(self):

        self.parser = argparse.ArgumentParser()
        self.parser.add_argument("--user", help="Qsync kullanıcı adı")
        self.parser.add_argument("--islem", help="İşlem seçimi")
        self.parser.add_argument("--kanal", help="Kanal seçimi")
        self.args = self.parser.parse_args()
        self.version = version
        self.versionLink = 'https://cb.teknolist.com/content_publisher/releases/' + self.version + '/Publisher.py'
        self.releaseVersionNumberLink = "https://cb.teknolist.com/content_publisher/latest.txt"
        self.releaseNotesLink = 'https://cb.teknolist.com/content_publisher/releases/' + self.version + '/release-notes.txt'

        print(publisherIcon + Colors.BOLD + version + Colors.ENDC)
        print(Colors.BOLD + 'Versiyondaki Değişiklikler:' + Colors.ENDC)
        print(self.getTxtContent('%s' % self.releaseNotesLink))

        self.PATH_TYPE_VERSION = "1"
        self.PATH_TYPE_SRC = "2"

        self.publisherConfPath = '../../../../../../../../contentpublisher.conf'
        self.publisherLogPath = '../../../../../../../../log.conf'

        self.insertPathLink = "https://cb.teknolist.com/content_browser/insert-path"
        self.settings = Publisher.loadConfFile(self)
        self.mediaFileExtensions = ['.avi', '.mp4', '.M3U8', '.m3u8']
        self.channel = "0"

        self.logger = logging.getLogger('log')
        hdlr = logging.FileHandler(self.publisherLogPath)
        formatter = logging.Formatter('%(asctime)s %(message)s')
        hdlr.setFormatter(formatter)
        self.logger.addHandler(hdlr)
        self.logger.setLevel(logging.WARNING)

    def getVersionLink(self, version):
        self.versionLink = 'https://cb.teknolist.com/content_publisher/releases/' + version + '/Publisher.py'
        return self.versionLink

    def setChannelPath(self, channel):
        self.channel = channel
        self.publishtemp = channel + '/src/publishtemp/'
        self.publish = channel + '/publish/'
        self.coverimgSource = channel + '/src/coverimg'
        self.coverimgDest = channel + '/publish/coverimg'
        self.contentDir = channel + '/src/content'
        self.confJson = channel + '/src/content/conf.json'
        self.src = channel + '/src'
        self.BTDContentSource = channel + '/src/guide'
        self.BTDContentDest = channel + '/publish/guide'

    def listdir_nohidden(self,path):
        return [f for f in os.listdir(path) if not f.startswith('.')]
    def getFiles(self, path):
        files = next(os.walk(path))
        return files[2]

    def getExtension(self, file):
        extension = os.path.splitext(file)[1]
        return extension

    def getFilesCount(self, files):
        fileCount = len(files)
        return fileCount

    def getMediaFilesCount(self, files):
        mediaCount = 0
        for file in files:
            if (self.isMediaFile(file)):
                mediaCount += 1
        return mediaCount

    def isMediaFile(self, file):
        extension = self.getExtension(file)
        if extension in self.mediaFileExtensions:
            return True

    # Verilen dosyayı ders adı olarak geri döner
    def regexName(self, mediaFile):
        regex = r"([a-zA-Z]+)([\d]+)_([a-zA-Z0-9]+)_([\d]+)[_]?([a-zA-Z0-9]+)?"
        match = re.search(regex, mediaFile)
        return match.group(0)

    def exportConfFile(self, data, destDir):
        with open(destDir + 'conf.json', 'w') as jsonData:
            self.log(['conf.json dosyası oluşturuluyor', data, jsonData])
            json.dump(data, jsonData)

    def createContentPublisherConf(self):
        #Eğer script çalıştırılırken "user" parametresi girilmişse değerini kullan yoksa input olarak talep et
        if self.args.user:
            username = self.args.user
        else:
            username = input("Lütfen Qsync kullanıcı adını giriniz:")
        data = {'user': username}
        with open(self.publisherConfPath, 'w') as outfile:
            json.dump(data, outfile)

    def loadConfFile(self):
        if os.path.exists(self.publisherConfPath):
            with open(self.publisherConfPath) as f:
                return json.load(f)
        else:
            self.createContentPublisherConf()

    def getNewVersion(self, version):
        if (os.path.exists('PublisherTemp.py')):
            os.remove('Publisher.py')
            os.rename('PublisherTemp.py', 'Publisher.py')
            self.log(Colors.WARNING + 'Versiyon Güncellendi.' + Colors.ENDC)
        else:
            link = publisher.getVersionLink(version)
            self.log(link)
            urllib.request.urlretrieve("%s" % link, "PublisherTemp.py")
            os.system('python PublisherTemp.py')
            self.log(Colors.WARNING + 'Temp dosyası açıldı.' + Colors.ENDC)
            exit()

    def checkPublisherVersion(self):
        latestVersion = self.getTxtContent(self.releaseVersionNumberLink).strip()
        if latestVersion != self.version or os.path.exists('PublisherTemp.py'):
            self.log(
                Colors.WARNING + self.version + ' -> ' + latestVersion + ' Versiyon Güncelleniyor...' + Colors.ENDC)
            self.getNewVersion(latestVersion)

    def selectChannel(self):
        global channel
        while True:
            try:
                # Eğer script çalıştırılırken "kanal" parametresi girilmişse değerini kullan yoksa input olarak talep et
                if publisher.args.kanal:
                    kanal = int(publisher.args.kanal)
                else:
                    kanal = int(input(Colors.OKGREEN + 'Lütfen versiyon almak istediğiniz kanalı seçiniz :' + Colors.ENDC))
                break
            except:
                self.log(Colors.FAIL + "Geçersiz seçim4!" +  Colors.ENDC)
        if (kanal == 0):
            channel = '0'
            return channel
        elif (kanal == 1):
            channel = '1'
            return channel
        else:
            self.log(Colors.FAIL + 'Lütfen geçerli bir kanal giriniz.' + Colors.ENDC)
            return self.selectChannel()

    # Verilen pathi content-browsera uygun hale getirir.
    def preparePathForInsertContentBrowser(self, path):
        regex = r"(ICERIK(.*))"
        match = re.search(regex, path)
        if match:
            pathBeforeOnline = match.group(2).replace('\\', '/')
            return '/teknolist_content/' + self.settings['user'] + pathBeforeOnline
        self.log(path + ' dizini QSYNC formatında olmadığı için content-browsera insert işlemi gerçekleştirilmemiştir.')
        input("Çıkmak için Enter'e tıklayın..")
        exit()

    # [KALDIRLDI]Content-Browser listesinin tamamını günceller.
    def refrestContentPath(self):
        self.log('Content-Browser dizin listesi güncelleniyor...')
        with urllib.request.urlopen("https://cb.teknolist.com/content_browser/refresh-content-path") as url:
            data = json.loads(url.read().decode())

    # Verilen pathdaki txt metnini döner.
    def getTxtContent(self, path):
        try:
            with urllib.request.urlopen(path) as response:
                html = response.read()
                encoding = response.headers.get_content_charset('utf-8')
                text = html.decode(encoding)
                return text
        except:
            self.log('Versiyon dökümanı için bağlantı kurulamadı.')

    # Verilen isimde publish klasörü içerisinde klasör oluşturur
    def createFolder(self, path):
        if not os.path.exists(path):
            os.makedirs(path)
            self.log(path + ' klasörü oluşturuldu.')
        return path

    # Versiyon adı üretir
    def generateVersion(self):
        versionName = time.strftime("%Y%m%d%H%M")
        return versionName

    # En son oluşturulan versiyon adını döner.
    def getLatestVersion(self, ):
        publishDir = os.getcwd() + '/' + self.publish
        files = publisher.listdir_nohidden(publishDir)
        files.sort(reverse=True)
        for file in files:
            if os.path.isdir(publishDir + '/' + file) and len(file) == 12:
                self.log('Yeni versiyon ' + file + ' versiyonundan türetildi.')
                return file
        return False

    # CoverImg klasörünün varlığını ve içeriğinin doğruluğunu teyit eder.
    def validateCoverImg(self):
        contentName = os.path.basename(os.getcwd())

        if not os.path.exists(self.coverimgSource):
            self.log(self.coverimgSource + ' klasörü bulunamadı.')
            input("Çıkmak için Enter'e tıklayın..")
            exit()

        if not os.path.exists(self.coverimgSource + '/' + contentName + '.jpg'):
            self.log('Beklenen coverimg adı:' + self.coverimgSource + '/' + contentName + '.jpg')
            self.log(
                'Doğru tanımlanmış coverimg bulunmadığından işlem durdurulmuştur\nLütfen src içerisindeki coverimg klasörü içerisindeki image dosyasını kontrol edip tekrar deneyiniz.')
            input("Çıkmak için Enter'e tıklayın..")
            exit()

    # BTD için source klasörünün varlığını ve içeriğinin doğruluğunu teyit eder.
    def validateBTDContent(self):
        contentName = os.path.basename(os.getcwd())
        if not os.path.exists(self.BTDContentSource):
            self.log(self.BTDContentSource + ' klasörü bulunamadı.')
            input("Çıkmak için Enter'e tıklayın..")
            exit()

        if not os.path.exists(self.BTDContentSource + '/' + contentName + '00K.pdf'):
            self.log('Beklenen kılavuz adı:' + self.BTDContentSource + '/' + contentName + '00K.pdf')
            self.log(
                'Doğru tanımlanmış BTD Kılavuzu bulunmadığından işlem durdurulmuştur\nLütfen src içerisindeki source klasörü içerisindeki kılavuz dosyasını kontrol edip tekrar deneyiniz.')
            input("Çıkmak için Enter'e tıklayın..")
            exit()

    # Aynı dizindeki conf.json dosyasını publish klasöründe oluşturulan versiyon klasörüne kopyalar.
    def copyConfFile(self, versionName):
        shutil.copyfile(self.confJson, self.publishtemp + '/conf.json')
        self.log('Conf dosyası kopyalandı.')

    # Bu metod coverimg klasöründeki dosya veya dosyaları publishTemp klasörüne taşır
    def moveCoverImgToPublishTemp(self, contentName):
        coverImageFileDir = self.coverimgSource + '/' + contentName + '.jpg'
        self.log(coverImageFileDir + ' resmi publishtemp klasörüne taşınıyor.')
        if os.path.exists(coverImageFileDir):
            publishTempDir = publisher.createFolder(self.publishtemp + '/coverimg')
            destination = os.path.join(publishTempDir, contentName + '.jpg')
            shutil.copy(coverImageFileDir, destination)

    # Bu metod guide klasöründeki dosya veya dosyaları publishTemp klasörüne taşır
    def moveGuideToPublishTemp(self, contentName):
        self.log('publistemp klasörü:' + self.publishtemp + 'guide')
        if os.path.exists(self.publishtemp + 'guide'):
            shutil.rmtree(self.publishtemp + 'guide')
            self.log(self.publishtemp + 'guide' + ' klasörü silindi.')
            publishTempGuide = publisher.createFolder(self.publishtemp + 'guide')
        if os.path.exists(self.BTDContentSource):
            shutil.copytree(self.BTDContentSource, self.publishtemp + 'guide')
            self.log('Guide klasörü publish temp klasörüne kopyalandı.')

    # publishtemp klasörü içerisindeki coverimg klasörünü publish klasörüne ve versionun içerisine kopyalar
    def renderCoverImgFromPublishTemp(self, versionName):
        if os.path.exists(self.coverimgDest):
            shutil.rmtree(self.coverimgDest)
            self.log(self.coverimgDest + ' klasörü silindi.')
        self.log('publistemp klasörü:' + self.publishtemp + 'coverimg')
        if os.path.exists(self.publishtemp + 'coverimg'):
            self.log(self.publishtemp + 'coverimg' + ' dosyası ' + self.coverimgDest + ' dizinine kopyalandı.')
            shutil.copytree(self.publishtemp + 'coverimg', self.coverimgDest)
            self.log('Coverimg klasörü kopyalandı.')

    # Src dizininden kaldırılan klasörler temp klasöründen silinir.
    def clearRemovedFolders(self):
        files = publisher.listdir_nohidden(self.publishtemp)
        for episode in files:
            if not os.path.exists(os.getcwd() + '/' + self.contentDir + '/' + episode):
                shutil.rmtree(self.publishtemp + episode)
                self.log(episode + ' klasörü temp klasöründen silindi.')

    # Verilen versiyon numarasının daha önce oluşturulup oluşturuladığını kontrol eder.
    def checkExistVersion(self, versionName):
        if os.path.exists(os.getcwd() + '/0/publish/' + versionName):
            self.log(
                versionName + ' versiyonu mevcut olduğundan versiyon işlemi yapılamamaktadır. Lütfen birazdan tekrar deneyiniz.')
            return True
        return False

    # Verilen type ve pathı content-browser veri sistemine girer
    def insertPath(self, path, type):
        if type == self.PATH_TYPE_SRC:
            target = os.path.abspath(os.path.join(self.preparePathForInsertContentBrowser(path), '..', '..'))
            source = os.path.basename(os.path.abspath(os.path.join(path, '..', '..')))
        else:
            target = os.path.abspath(os.path.join(self.preparePathForInsertContentBrowser(path), '..', '..', '..'))
            source = os.path.basename(os.path.abspath(os.path.join(path, '..', '..', '..')))

        target = target.lstrip('D:')
        target = target.lstrip('C:')
        target = target.replace('\\', '/')
        self.syncS3(source, target)
        self.log(path + '  dizin listesi ekleniyor...')
        with urllib.request.urlopen(
                self.insertPathLink + "?path=" + self.preparePathForInsertContentBrowser(
                    path) + "&type=" + type) as url:
            data = json.loads(url.read().decode())
            self.log(data)

    # S3 ile senkronize edecek
    def syncS3(self, source, target):
        command = 'aws s3 sync ../' + source + ' s3://teknolist-nas' + target
        self.log(command + ' dizinine gönderim yapılıyor, LÜTFEN BEKLEYİNİZ...')
        process = subprocess.Popen(command.split(), stdout=subprocess.PIPE)
        output, error = process.communicate()

    # publishtemp klasörünü siler
    def removePublishTemp(self):
        if (os.path.exists(self.publishtemp)):
            shutil.rmtree(self.publishtemp)

    def detectContentType(self):
        contentType = os.path.basename(os.path.abspath(os.path.join(os.getcwd(), '..', '..', '..', '..')))
        self.log(Colors.OKGREEN + 'İçerik Tipi:' + Colors.BOLD + contentType + Colors.ENDC)
        return contentType

    def copyAndMergeTree(self, src, dst, symlinks=False, ignore=None):
        self.log(src + ' dizini ' + dst + ' hedefi için Kopyalama-Birleştirme işlemi yapılıyor.')
        if not os.path.exists(dst):
            os.makedirs(dst)
            self.log(dst + ' Klasörü Oluşturuldu.')
        for item in publisher.listdir_nohidden(src):
            if item != 'publishtemp':
                s = os.path.join(src, item)
                d = os.path.join(dst, item)
                if os.path.isdir(s):
                    self.copyAndMergeTree(s, d, symlinks, ignore)
                else:
                    #          if not os.path.exists(d) or os.stat(s).st_mtime - os.stat(d).st_mtime > 1:
                    shutil.copy2(s, d)

    def log(self, text):
        print(text)
        self.logger.error(text)

    def createSrcBackup(self):
        onlyVersion = len([s for s in next(os.walk(self.publish))[1] if s.isdigit()])

        if (onlyVersion == 1):
            backupDestination = self.publish + self.getLatestVersion() + '/backup'
            self.createFolder(backupDestination)
            self.copyAndMergeTree(self.src + '/', backupDestination)
            print('Src Klasörüne ait yedekleme Yapıldı')


"""
########################################################################################################################
#
#                                                   KA_PUBLISHER                        
#                                   Bu Class KA_EA_VKA ile ilgili metodları içeri
########################################################################################################################
"""


class KA_Publisher():

    # Çalıştığı dizindeki sahneleri (/publish/web) dizinin publishdeki versyion klasörüne taşır.
    def movePublishScene(self):
        files = publisher.listdir_nohidden(publisher.contentDir)
        for episode in files:
            if (os.path.isdir(publisher.contentDir + '/' + episode) and os.path.exists(
                    publisher.contentDir + '/' + episode + '/publish/web')):
                if os.path.exists(publisher.publishtemp + episode):
                    shutil.rmtree(publisher.publishtemp + episode)
                shutil.move(publisher.contentDir + '/' + episode + '/publish/web', publisher.publishtemp + episode)
                publisher.log(episode + ' klasörü temp  klasörüne taşındı.')

    def versionProcess(self):
        versionName = publisher.generateVersion()
        contentName = os.path.basename(os.getcwd())

        if (publisher.channel == '0'):
            if (content_type in ['YEM', 'EB','CKA']):
                self.publishForSrc(versionName)
            else:
                self.publishForOldPlayer(versionName)
        elif (publisher.channel == '1'):
            self.publishForHypePlayer()
        if publisher.checkExistVersion(versionName):
            self.selectProcess()
            exit()
        publisher.moveCoverImgToPublishTemp(contentName)
        publisher.renderCoverImgFromPublishTemp(versionName)
        if (content_type in ['BTD']):
            publisher.moveGuideToPublishTemp(versionName)
        shutil.copytree(os.getcwd() + '/' + publisher.publishtemp,
                        os.getcwd() + '/' + channel + '/publish/' + versionName)
        publisher.insertPath(os.getcwd() + '/' + channel + '/publish/' + versionName, publisher.PATH_TYPE_VERSION)
        publisher.createSrcBackup()

    def publishForSrc(self, versionName):
        publisher.createFolder(publisher.publishtemp)
        publisher.copyAndMergeTree(publisher.src, publisher.publishtemp)

    def publishForOldPlayer(self, versionName):
        publisher.createFolder(publisher.publishtemp)
        publisher.copyConfFile(versionName)
        self.movePublishScene()
        publisher.clearRemovedFolders()

    def publishForHypePlayer(self):
        contentName = os.path.basename(os.getcwd())
        files = publisher.listdir_nohidden(publisher.contentDir)
        publisher.removePublishTemp()
        publisher.createFolder(publisher.publishtemp)

        for file in files:
            if (file != contentName + '.hype' and fnmatch.fnmatch(file, contentName + '.*') or file == 'conf.json'):
                if (file == contentName + '.sound'):
                    shutil.copytree(publisher.contentDir + '/' + file, publisher.publishtemp + file)
                    publisher.log(file + ' klasörü temp  klasörüne kopyalandı.')
                else:
                    shutil.move(publisher.contentDir + '/' + file, publisher.publishtemp + file)
                    publisher.log(file + ' klasörü temp  klasörüne taşındı.')

    def selectProcess(self):
        global channel
        print(Colors.OKGREEN + '[1] Versiyon oluştur.' + Colors.ENDC)
        print(Colors.OKGREEN + '[2] Src dizinini ekle' + Colors.ENDC)

        while True:
            try:
                # Eğer script çalıştırılırken "islem" parametresi girilmişse değerini kullan yoksa input olarak talep et
                if publisher.args.islem:
                    islem = int(publisher.args.islem)
                else:
                    islem = int(input('Lütfen yapmak istediğinz işlemi seçiniz :'))
                break
            except:
                publisher.log("Geçersiz seçim2!")
        if (islem == 1):
            # if(content_type not in ['EVA', 'YEM','EB']):
            publisher.validateCoverImg()
            if (content_type in ['BTD']):
                publisher.validateBTDContent()
            self.versionProcess()
        elif (islem == 2):
            publisher.insertPath(os.getcwd() + '/' + channel + '/src', publisher.PATH_TYPE_SRC)
        else:
            publisher.log('Lütfen geçerli bir işlem giriniz.')
            publisher.log(islem)
            self.selectProcess()


"""
########################################################################################################################
#
#                                                   VS_PUBLISHER                        
#                                    Bu Class VS_VKA ile ilgili metodları içeri
########################################################################################################################
"""


class VS_Publisher():

    def __init__(self):
        self.sourcePath = ''
        self.selectSourcePath()
        self.adaptiveDir = '/H264HLS'
        self.adaptiveDir265 = '/H265HLS'
        self.renderDir = '/H264'
        self.renderH265Dir = '/H265'
        self.rawDir = '/raw'
        self.encodeDir = '/encode'
        self.contentDir = '/content'
        self.projectfilesDir = '/projectfiles'
        self.coverimgDir = '/coverimg'

        self.sourceRenderDir = self.sourcePath + self.renderDir
        self.sourceRenderH265Dir = self.sourcePath + self.renderH265Dir
        self.sourceAdaptiveDir = self.sourcePath + self.adaptiveDir
        self.sourceAdaptive265Dir = self.sourcePath + self.adaptiveDir265
        self.sourceRawDir = self.sourcePath + self.rawDir
        self.sourceEncodeDir = self.sourcePath + self.encodeDir
        self.sourceContentDir = self.sourcePath + self.contentDir
        self.sourceProjectFilesDir = self.sourcePath + self.projectfilesDir
        self.sourceCoverImgDir = self.sourcePath + self.coverimgDir

        self.publisherDir = os.getcwd()
        self.contentsDir = os.path.abspath(os.path.join(self.publisherDir, "../")) + '/'

        publisher.coverimgDest = publisher.channel + '/publish/coverimg'
        publisher.coverimgSource = self.sourcePath + '/coverimg'

    def channelDir(self, channel, lessonName):
        return self.lessonDir(lessonName) + '/' + channel

    def prepare0Channel(self):
        files = publisher.listdir_nohidden(self.sourceRenderDir)
        for file in files:
            lessonName = publisher.regexName(file).upper()
            publishTempDir = publisher.createFolder(self.channelDir('0', lessonName) + '/src/publishtemp')

            source = os.path.join(self.sourceRenderDir, file)
            destination = os.path.join(publishTempDir, file)
            shutil.move(source, destination)
            publisher.log(self.sourceRenderDir + file + ' dosyası taşındı.')
            self.createConfForMediaFile(publishTempDir)
            publisher.copyAndMergeTree(publishTempDir, self.channelDir('0', lessonName) + '/publish/' + versionName)
            publisher.insertPath(self.channelDir('0', lessonName) + '/publish/' + versionName,
                                 publisher.PATH_TYPE_VERSION)

    def prepare2Channel(self):
        files = publisher.listdir_nohidden(self.sourceRenderH265Dir)
        for file in files:
            lessonName = publisher.regexName(file).upper()
            publishTempDir = publisher.createFolder(self.channelDir('2', lessonName) + '/src/publishtemp')

            source = os.path.join(self.sourceRenderH265Dir, file)
            destination = os.path.join(publishTempDir, file)
            shutil.move(source, destination)
            publisher.log(self.sourceRenderH265Dir + file + ' dosyası taşındı.')
            self.createConfForMediaFile(publishTempDir)
            publisher.copyAndMergeTree(publishTempDir, self.channelDir('2', lessonName) + '/publish/' + versionName)
            publisher.insertPath(self.channelDir('2', lessonName) + '/publish/' + versionName,
                                 publisher.PATH_TYPE_VERSION)

    def prepareCoverImgBatch(self):
        files = publisher.listdir_nohidden(self.sourceCoverImgDir)
        channels = ["0", "1", "2", "3"]
        for file in files:
            filePath = os.path.join(self.sourceCoverImgDir, file)
            if (os.path.isfile(filePath)):
                lessonName = publisher.regexName(file).upper()
                for channel in channels:
                    publisher.publishtemp = publisher.createFolder(
                        self.channelDir(channel, lessonName) + '/src/publishtemp/')
                    publisher.coverimgDest = publisher.createFolder(
                        self.channelDir(channel, lessonName) + '/publish/coverimg/')
                    publisher.moveCoverImgToPublishTemp(lessonName)
                    publisher.renderCoverImgFromPublishTemp(version)
                    publisher.log(filePath + ' dosyası taşındı.')
                os.remove(filePath)
            else:
                channelFileList = publisher.listdir_nohidden(filePath)
                publisher.setChannelPath(file)
                publisher.coverimgSource = filePath
                for channelFile in channelFileList:
                    channelFilePath = os.path.join(filePath, channelFile)
                    lessonName = publisher.regexName(channelFile).upper()
                    publisher.publishtemp = publisher.createFolder(
                        self.channelDir(file, lessonName) + '/src/publishtemp/')
                    publisher.coverimgDest = publisher.createFolder(
                        self.channelDir(file, lessonName) + '/publish/coverimg/')
                    publisher.moveCoverImgToPublishTemp(lessonName)
                    publisher.renderCoverImgFromPublishTemp(version)
                    publisher.log(channelFilePath + ' dosyası taşındı.')
                    os.remove(channelFilePath)
                shutil.rmtree(filePath)

    def prepare1Channel(self):
        files = publisher.listdir_nohidden(self.sourceAdaptiveDir)
        if files:
            for file in files:
                lessonName = publisher.regexName(file).upper()

                publishTempDir = publisher.createFolder(self.channelDir('1', lessonName) + '/src/publishtemp')

                source = os.path.join(self.sourceAdaptiveDir, file)
                publisher.copyAndMergeTree(source, publishTempDir)
                publisher.log(source + ' klasörü kopyalandı.')

                self.upperFileNamesFromAdaptiveDir(source, publishTempDir)

                shutil.rmtree(source)
                publisher.log(source + ' klasörü silindi.')

                self.createConfForMediaFile(publishTempDir)
                publisher.copyAndMergeTree(publishTempDir, self.channelDir('1', lessonName) + '/publish/' + versionName)
                publisher.insertPath(self.channelDir('1', lessonName) + '/publish/' + versionName,
                                     publisher.PATH_TYPE_VERSION)

    def prepare3Channel(self):
        files = publisher.listdir_nohidden(self.sourceAdaptive265Dir)
        if files:
            for file in files:
                lessonName = publisher.regexName(file).upper()
                publishTempDir = publisher.createFolder(self.channelDir('3', lessonName) + '/src/publishtemp')

                source = os.path.join(self.sourceAdaptive265Dir, file)
                publisher.copyAndMergeTree(source, publishTempDir)
                publisher.log(source + ' klasörü kopyalandı.')

                self.upperFileNamesFromAdaptiveDir(source, publishTempDir)

                shutil.rmtree(source)
                publisher.log(source + ' klasörü silindi.')

                self.createConfForMediaFile(publishTempDir)
                publisher.copyAndMergeTree(publishTempDir, self.channelDir('3', lessonName) + '/publish/' + versionName)
                publisher.insertPath(self.channelDir('3', lessonName) + '/publish/' + versionName,
                                     publisher.PATH_TYPE_VERSION)

    def moveRawFilesToSrc(self):
        files = publisher.listdir_nohidden(self.sourceRawDir)
        for file in files:
            lessonName = publisher.regexName(file)
            sourcePath = self.lessonDir(lessonName) + '/0/src/raw/'
            publisher.createFolder(sourcePath)
            shutil.move(self.sourceRawDir + '/' + file, sourcePath + '/' + file)
            publisher.log(self.sourceRawDir + '/' + file + ' dosyası taşındı.')

    def moveEncodeFilesToSrc(self):
        files = publisher.listdir_nohidden(self.sourceEncodeDir)
        for file in files:
            lessonName = publisher.regexName(file)
            sourcePath = self.lessonDir(lessonName) + '/0/src/encode/'
            publisher.createFolder(sourcePath)
            shutil.move(self.sourceEncodeDir + '/' + file, sourcePath + '/' + file)
            publisher.log(self.sourceEncodeDir + '/' + file + ' dosyası taşındı.')

    def moveContentFilesToSrc(self):
        files = publisher.listdir_nohidden(self.sourceContentDir)
        for file in files:
            extension = publisher.getExtension(file)
            if extension not in ['.aep', '.prproj', '']:
                lessonName = publisher.regexName(file)
                sourcePathSrc = self.lessonDir(lessonName) + '/0/src/content/'
                publisher.createFolder(sourcePathSrc)
                shutil.move(self.sourceContentDir + '/' + file, sourcePathSrc + '/' + file)
                publisher.log(self.sourceContentDir + '/' + file + ' dosyası taşındı.')

    def moveProjectFiles(self):
        sourcePathSrc = '..' + self.projectfilesDir
        publisher.createFolder(sourcePathSrc)
        files = publisher.listdir_nohidden(self.sourceProjectFilesDir)
        for file in files:
            shutil.move(self.sourceProjectFilesDir + '/' + file, sourcePathSrc + '/' + file)
            publisher.log(self.sourceProjectFilesDir + '/' + file + ' dosyası taşındı.')

    def createConfForMediaFile(self, publishTempDir):
        if publishTempDir:
            files = publisher.getFiles(publishTempDir)
            mediaFile = 0
            for file in files:
                if publisher.isMediaFile(file):
                    mediaFile = file
                    break
            data = {
                'fileCount': publisher.getFilesCount(files),
                'mediaFileCount': publisher.getMediaFilesCount(files),
                'fileExtension': publisher.getExtension(mediaFile)
            }
            publisher.exportConfFile(data, publishTempDir + '/')

    def upperFileNamesFromAdaptiveDir(self, source, publishTempDir):
        publishFiles = publisher.listdir_nohidden(source)
        for publishFile in publishFiles:
            if publisher.isMediaFile(publishFile):
                os.rename(publishTempDir + '/' + publishFile, publishTempDir + '/' + publishFile.upper())
                publisher.log(publishFile + ' dosyasının adı büyük harfe dönüştürüldü.')

    def versionProcess(self):
        global versionName
        versionName = publisher.generateVersion()
        try:
            if os.path.exists(self.sourceCoverImgDir):
                publisher.log('CoverImg oluşturuluyor.')
                self.prepareCoverImgBatch()
            if os.path.exists(self.sourceAdaptiveDir):
                publisher.log('1. Kanal oluşturuluyor.')
                self.prepare1Channel()
            if os.path.exists(self.sourceRenderH265Dir):
                publisher.log('2. Kanal oluşturuluyor.')
                self.prepare2Channel()
            if os.path.exists(self.sourceAdaptive265Dir):
                publisher.log('3. Kanal oluşturuluyor.')
                self.prepare3Channel()
            if os.path.exists(self.sourceRenderDir):
                publisher.log('0. Kanal oluşturuluyor.')
                self.prepare0Channel()

            self.prepareSrcFolders()

        except Exception as ex:
            publisher.log('İşlem sırasında hata oluştu:')
            print(ex)
            input("Çıkmak için Enter'e tıklayın..")
            exit()

    def lessonDir(self, lessonName):
        return self.contentsDir + lessonName

    def prepareSrcFolders(self):
        if os.path.exists(self.sourceRawDir):
            publisher.log('Raw Klasöründeki dosyalar 0 Kanalındaki Src içerisine dağıtılıyor.')
            self.moveRawFilesToSrc()
        if os.path.exists(self.sourceEncodeDir):
            publisher.log('Encode Klasöründeki dosyalar 0 Kanalındaki Src içerisine dağıtılıyor.')
            self.moveEncodeFilesToSrc()
        if os.path.exists(self.sourceContentDir):
            publisher.log('Content Klasöründeki dosyalar 0 Kanalındaki Src içerisine dağıtılıyor.')
            self.moveContentFilesToSrc()
        if os.path.exists(self.sourceProjectFilesDir):
            publisher.log('projectfiles Klasöründeki dosyalar projectfiles içerisine dağıtılıyor.')
            self.moveProjectFiles()

    def selectProcess(self):
        print(' [1] Versiyon oluştur.')
        print(' [2] Content-Browser konu dizinlerini güncelle')

        while True:
            try:
                islem = int(input('Lütfen yapmak istediğinz işlemi seçiniz:'))
                break
            except:
                print("Geçersiz seçim3!")
        if (islem == 1):
            # publisher.validateCoverImg()
            self.versionProcess()
        elif (islem == 2):
            publisher.refrestContentPath()
        else:
            publisher.log('Lütfen geçerli bir işlem giriniz.')
            publisher.log(islem)
            self.selectProcess()

    def selectSourcePath(self):
        path = input('Lütfen kaynak dosyaların bulunduğu path adresini yazınız:')
        if (os.path.isdir(path)):
            publisher.log('Geçerli Dizin')
            self.sourcePath = path
            publisher.log(publisher.listdir_nohidden(path))
        else:
            publisher.log('Geçersiz dizin yolu')
            self.selectSourcePath()


#
# print('İşlem başarıyla tamamlanmıştır.')
# input("Çıkmak için Enter'e tıklayın..")

publisher = Publisher()
try:
    publisher.checkPublisherVersion()
    content_type = publisher.detectContentType()
    if content_type in ['KA', 'EA', 'EVA',  'YEM', 'EB', 'DM', 'YEA', 'HDE','ESK', 'YMT', 'BTD', 'BUP', 'MTL', 'DKT','DEA','ECK','EKA',  'EAK', 'EBK',   'DIM',  'YKT', 'EKT', 'EBA']:
        channel = publisher.selectChannel()
        publisher.setChannelPath(channel)
        KA_Publisher = KA_Publisher()
        KA_Publisher.selectProcess()
    elif content_type in ['VS', 'VKA', 'VKB','OKA', 'VSC',  'VOS']:
        VS_Publisher = VS_Publisher()
        VS_Publisher.selectProcess()

    else:
        publisher.log(
            'Dizin yapısı içerisinde içerik tipi bulunamadı. Publisherı doğru dizinde çalıştırdığınıza emin olunuz.')
        exit()
    publisher.log('İşlem başarıyla tamamlanmıştır.')
except Exception as e:
    publisher.log(['[HATA]', e.g])
    exit()

input("Çıkmak için Enter'e tıklayın..")
