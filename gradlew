#!/bin/sh
##############################################################################
# Gradle start up script for POSIX
# zyChat Android Base APK Build Wrapper
##############################################################################

# Attempt to set APP_HOME
app_path=$0

while [ -h "$app_path" ]; do
    ls=$(ls -ld "$app_path")
    link=$(expr "$ls" : '.*-> \(.*\)$')
    if expr "$link" : '/.*' > /dev/null; then
        app_path="$link"
    else
        app_path=$(dirname "$app_path")"/$link"
    fi
done

APP_BASE_NAME=${0##*/}
APP_HOME=$(cd "$(dirname "$app_path")" && pwd -P) || exit

DEFAULT_JVM_OPTS='"-Xmx1024m" "-Xms256m"'

warn () {
    echo "$*"
} >&2

die () {
    echo
    echo "$*"
    echo
    exit 1
} >&2

CLASSPATH=$APP_HOME/gradle/wrapper/gradle-wrapper.jar

if [ -n "$JAVA_HOME" ] ; then
    if [ -x "$JAVA_HOME/jre/sh/java" ] ; then
        JAVACMD=$JAVA_HOME/jre/sh/java
    else
        JAVACMD=$JAVA_HOME/bin/java
    fi
    if [ ! -x "$JAVACMD" ] ; then
        die "ERROR: JAVA_HOME is set to an invalid directory: $JAVA_HOME"
    fi
else
    JAVACMD=java
    which java >/dev/null 2>&1 || die "ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH."
fi

# Fallback: if gradle is installed on CI runner, run gradle directly
if [ ! -f "$CLASSPATH" ]; then
    if command -v gradle >/dev/null 2>&1; then
        exec gradle "$@"
    fi
fi

eval set -- "$DEFAULT_JVM_OPTS" "$JAVA_OPTS" "$GRADLE_OPTS" "\"-Dorg.gradle.appname=$APP_BASE_NAME\"" -classpath "\"$CLASSPATH\"" org.gradle.wrapper.GradleWrapperMain '"$@"'
exec "$JAVACMD" "$@"
